import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonProgressBar,
  IonSpinner
} from '@ionic/angular/standalone';
import { AlertController, ToastController, Platform } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  map, 
  play, 
  desktop, 
  person, 
  trophy, 
  time, 
  search, 
  help, 
  location, 
  checkmarkCircle, 
  close,
  refresh
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';

import { TreasureHuntService, GameState, TreasureLocation } from '../services/treasure-hunt.service';
import { GeolocationService, Position } from '../services/geolocation.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonProgressBar,
    IonSpinner
  ],
})
export class HomePage implements OnInit, OnDestroy {
  gameState: GameState = {
    isStarted: false,
    currentLocationIndex: 0,
    score: 0,
    playerName: ''
  };
  
  currentLocation: TreasureLocation | null = null;
  currentPosition: Position | null = null;
  playerName: string = '';
  showHint: boolean = false;
  showMap: boolean = false;
  totalLocations: number = 0;
  isDebugMode: boolean = true; // Ativar para desenvolvimento
  isDesktop: boolean = false;
  showDesktopMap: boolean = false;
  
  private gameSubscription?: Subscription;
  private locationSubscription?: Subscription;
  private positionSubscription?: Subscription;
  private map?: L.Map;
  
  constructor(
    private treasureHuntService: TreasureHuntService,
    private geolocationService: GeolocationService,
    private alertController: AlertController,
    private toastController: ToastController,
    private platform: Platform
  ) {
    addIcons({ 
      map, 
      play, 
      desktop, 
      person, 
      trophy, 
      time, 
      search, 
      help, 
      location, 
      checkmarkCircle, 
      close,
      refresh 
    });
  }

  ngOnInit() {
    this.initializeGame();
    this.requestLocationPermissions();
    
    // Detectar se está no desktop
    this.isDesktop = this.platform.width() > 768;
    if (this.isDesktop) {
      this.showDesktopMap = true;
      setTimeout(() => {
        this.initializeDesktopMap();
      }, 500);
    }
  }

  ngOnDestroy() {
    this.gameSubscription?.unsubscribe();
    this.locationSubscription?.unsubscribe();
    this.positionSubscription?.unsubscribe();
    this.geolocationService.stopWatchingPosition();
    
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeGame() {
    // Subscribe to game state
    this.gameSubscription = this.treasureHuntService.gameState$.subscribe(state => {
      this.gameState = state;
      this.currentLocation = this.treasureHuntService.getCurrentLocation();
      
      // Atualizar mapas quando o estado mudar
      if (this.showMap && this.map) {
        setTimeout(() => this.initializeMap(), 100);
      }
      if (this.isDesktop && this.showDesktopMap && this.map) {
        setTimeout(() => this.initializeDesktopMap(), 100);
      }
    });

    // Subscribe to locations
    this.locationSubscription = this.treasureHuntService.locations$.subscribe(locations => {
      this.totalLocations = locations.length;
    });

    // Subscribe to position
    this.positionSubscription = this.geolocationService.currentPosition$.subscribe(position => {
      this.currentPosition = position;
      
      // Atualizar mapas quando a posição mudar
      if (this.showMap && this.map) {
        setTimeout(() => this.initializeMap(), 100);
      }
      if (this.isDesktop && this.showDesktopMap && this.map) {
        setTimeout(() => this.initializeDesktopMap(), 100);
      }
    });
  }

  private async requestLocationPermissions() {
    const hasPermission = await this.geolocationService.requestPermissions();
    if (hasPermission) {
      await this.geolocationService.getCurrentPosition();
      await this.geolocationService.startWatchingPosition();
    } else {
      this.showToast('Permissão de localização é necessária para jogar', 'warning');
    }
  }

  async startGame() {
    if (!this.playerName.trim()) {
      this.showToast('Por favor, digite seu nome', 'warning');
      return;
    }

    this.treasureHuntService.startGame(this.playerName.trim());
    this.showHint = false;
    
    this.showToast(`Boa sorte, ${this.playerName}!`, 'success');
  }

  getElapsedTime(): string {
    if (!this.gameState.startTime) return '00:00';
    
    const now = new Date();
    const elapsed = now.getTime() - this.gameState.startTime.getTime();
    return this.formatTime(elapsed);
  }

  formatTime(milliseconds?: number): string {
    if (!milliseconds) return '00:00';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getProgress(): number {
    return this.gameState.currentLocationIndex / this.totalLocations;
  }

  getDistanceToTarget(): number {
    if (!this.currentPosition || !this.currentLocation) return 0;
    
    return Math.round(
      this.treasureHuntService.calculateDistance(
        this.currentPosition.latitude,
        this.currentPosition.longitude,
        this.currentLocation.latitude,
        this.currentLocation.longitude
      )
    );
  }

  canCheckLocation(): boolean {
    if (!this.currentPosition || !this.currentLocation) return false;
    
    const distance = this.getDistanceToTarget();
    return distance <= 5; // 5 metros de tolerância para mais precisão
  }

  async checkLocation() {
    if (!this.currentLocation) return;
    
    const success = this.treasureHuntService.completeLocation(this.currentLocation.id);
    
    if (success) {
      await this.showSuccessAlert();
      this.showHint = false;
      
      // Check if game completed
      if (this.gameState.currentLocationIndex >= this.totalLocations) {
        await this.showCompletionAlert();
      }
    }
  }

  private async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Parabéns!',
      message: `Você encontrou: ${this.currentLocation?.description}`,
      buttons: ['Continuar']
    });
    
    await alert.present();
  }

  private async showCompletionAlert() {
    const alert = await this.alertController.create({
      header: 'Jogo Concluído!',
      message: `Parabéns! Você completou a caça ao tesouro em ${this.formatTime(this.gameState.totalTime)}!`,
      buttons: ['Ver Resultados']
    });
    
    await alert.present();
  }

  resetGame() {
    this.treasureHuntService.resetGame();
    this.playerName = '';
    this.showHint = false;
    this.showMap = false;
  }

  // Função para simular localização durante desenvolvimento
  simulateCurrentLocation() {
    if (!this.currentLocation) return;
    
    this.geolocationService.simulatePosition(
      this.currentLocation.latitude,
      this.currentLocation.longitude
    );
    
    this.showToast('Localização simulada!', 'success');
  }

  // Map functions
  toggleMap() {
    this.showMap = !this.showMap;
    
    if (this.showMap) {
      setTimeout(() => {
        this.initializeMap();
      }, 100);
    }
  }

  toggleDesktopMap() {
    this.showDesktopMap = !this.showDesktopMap;
    
    if (this.showDesktopMap) {
      setTimeout(() => {
        this.initializeDesktopMap();
      }, 100);
    }
  }

  private initializeMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Coordenadas centrais da Univali (próximo à biblioteca real)
    const univaliCenter: [number, number] = [-26.91462528777161, -48.6628096151779];

    this.map = L.map('map').setView(univaliCenter, 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add markers for all locations
    const locations = this.treasureHuntService.getAllLocations();
    locations.forEach((location, index) => {
      const isCompleted = location.isCompleted;
      const isCurrent = index === this.gameState.currentLocationIndex;
      
      let iconColor = 'grey';
      if (isCompleted) iconColor = 'green';
      else if (isCurrent) iconColor = 'red';

      const marker = L.marker([location.latitude, location.longitude])
        .addTo(this.map!)
        .bindPopup(`
          <b>${location.name}</b><br>
          ${isCompleted ? '✅ Concluído' : isCurrent ? '📍 Atual' : '⏳ Pendente'}<br>
          ${location.description}
        `);
    });

    // Add current position if available
    if (this.currentPosition) {
      L.marker([this.currentPosition.latitude, this.currentPosition.longitude])
        .addTo(this.map)
        .bindPopup('📱 Sua localização atual')
        .openPopup();
    }
  }

  private initializeDesktopMap() {
    const mapElement = document.getElementById('desktop-map');
    if (!mapElement) return;

    // Coordenadas centrais da Univali (próximo à biblioteca real)
    const univaliCenter: [number, number] = [-26.91462528777161, -48.6628096151779];

    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('desktop-map').setView(univaliCenter, 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add markers for all locations with more detail for desktop
    const locations = this.treasureHuntService.getAllLocations();
    locations.forEach((location, index) => {
      const isCompleted = location.isCompleted;
      const isCurrent = index === this.gameState.currentLocationIndex;
      
      let iconHtml = '';
      if (isCompleted) {
        iconHtml = '<div style="background-color: green; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-weight: bold;">✓</div>';
      } else if (isCurrent) {
        iconHtml = '<div style="background-color: red; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-weight: bold;">' + (index + 1) + '</div>';
      } else {
        iconHtml = '<div style="background-color: orange; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-weight: bold;">' + (index + 1) + '</div>';
      }

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-div-icon',
        iconSize: [25, 25],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([location.latitude, location.longitude], { icon: customIcon })
        .addTo(this.map!)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3>${location.name}</h3>
            <p><strong>Status:</strong> ${isCompleted ? '✅ Concluído' : isCurrent ? '📍 Atual' : '⏳ Pendente'}</p>
            <p><strong>Descrição:</strong> ${location.description}</p>
            <p><strong>Pista:</strong> ${location.clue}</p>
            <p><strong>Dica:</strong> ${location.hint}</p>
          </div>
        `);
    });

    // Add current position if available
    if (this.currentPosition) {
      const playerIcon = L.divIcon({
        html: '<div style="background-color: blue; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-weight: bold;">👤</div>',
        className: 'player-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([this.currentPosition.latitude, this.currentPosition.longitude], { icon: playerIcon })
        .addTo(this.map)
        .bindPopup('📱 Sua localização atual')
        .openPopup();
    }
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    
    await toast.present();
  }
}
