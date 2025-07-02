import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TreasureLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  clue: string;
  hint: string;
  description: string;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface GameState {
  isStarted: boolean;
  currentLocationIndex: number;
  startTime?: Date;
  endTime?: Date;
  totalTime?: number;
  score: number;
  playerName: string;
}

@Injectable({
  providedIn: 'root'
})
export class TreasureHuntService {
  private gameStateSubject = new BehaviorSubject<GameState>({
    isStarted: false,
    currentLocationIndex: 0,
    score: 0,
    playerName: ''
  });

  private locationsSubject = new BehaviorSubject<TreasureLocation[]>([]);

  public gameState$ = this.gameStateSubject.asObservable();
  public locations$ = this.locationsSubject.asObservable();  // Localizações da Univali (coordenadas ajustadas para pontos específicos do campus)
  private univaliLocations: TreasureLocation[] = [
    {
      id: 1,
      name: 'Biblioteca Central',
      latitude: -26.914746110990,
      longitude: -48.662801619573,
      clue: 'Em um lugar silencioso onde o conhecimento mora, milhares de histórias aguardam quem explora.',
      hint: 'É o coração do saber acadêmico',
      description: 'Biblioteca Central da Univali',
      isCompleted: false
    },
    {
      id: 2,
      name: 'Reitoria',
      latitude: -26.914527000439,
      longitude: -48.6623710312343,
      clue: 'Onde as decisões importantes são tomadas, e o futuro da universidade é moldado.',
      hint: 'Centro administrativo principal',
      description: 'Prédio da Reitoria',
      isCompleted: false
    },
    {
      id: 3,
      name: 'Laboratório de Informática',
      latitude: -26.914793812635015,
      longitude: -48.66186452710039,
      clue: 'Códigos e algoritmos aqui ganham vida, onde bits e bytes se transformam em magia.',
      hint: 'Onde os programadores nascem',
      description: 'Laboratório de Informática',
      isCompleted: false
    },
    {
      id: 4,
      name: 'Quadra Esportiva',
      latitude: -26.915669498631438,
      longitude: -48.66281798935713,
      clue: 'Suor e esforço se misturam aqui, onde o corpo e a mente se fortalecem.',
      hint: 'Local para atividades físicas',
      description: 'Quadra Poliesportiva',
      isCompleted: false
    },
    {
      id: 5,
      name: 'Cantina Universitária',
      latitude: -26.9145784325116,
      longitude: -48.66167383465906,
      clue: 'O aroma delicioso paira no ar, onde a fome encontra seu final.',
      hint: 'Onde todos se reúnem para refeições',
      description: 'Cantina Central',
      isCompleted: false
    },
    {
      id: 6,
      name: 'Auditório Principal',
      latitude: -26.915152278415206,
      longitude: -48.66324387213246,
      clue: 'Onde grandes ideias ecoam e apresentações ganham vida, palco de conhecimento e cultura.',
      hint: 'Local de eventos e palestras',
      description: 'Auditório Principal',
      isCompleted: false
    },
    {
      id: 7,
      name: 'Estacionamento Principal',
      latitude: -26.91804075602041,
      longitude: -48.666441131742566,
      clue: 'Onde ferraduras de ferro descansam em fileiras organizadas, aguardando o retorno de seus donos.',
      hint: 'Local onde veículos ficam estacionados',
      description: 'Estacionamento Central',
      isCompleted: false
    },
    {
      id: 8,
      name: 'Praça Central da Tecnologia',
      latitude: -26.914750,
      longitude: -48.662750,
      clue: 'No coração da área da tecnologia do campus, onde estudantes se encontram e a vida acadêmica pulsa.',
      hint: 'Centro de convivência da tecnologia ao ar livre',
      description: 'Praça Central da Tecnologia',
      isCompleted: false
    }
  ];

  constructor() {
    this.locationsSubject.next([...this.univaliLocations]);
  }

  startGame(playerName: string): void {
    const gameState: GameState = {
      isStarted: true,
      currentLocationIndex: 0,
      startTime: new Date(),
      score: 0,
      playerName: playerName
    };
    
    // Reset locations
    this.univaliLocations.forEach(location => {
      location.isCompleted = false;
      location.completedAt = undefined;
    });
    
    this.locationsSubject.next([...this.univaliLocations]);
    this.gameStateSubject.next(gameState);
  }

  completeLocation(locationId: number): boolean {
    const locations = this.locationsSubject.value;
    const currentGameState = this.gameStateSubject.value;
    
    const locationIndex = locations.findIndex(loc => loc.id === locationId);
    
    if (locationIndex === currentGameState.currentLocationIndex) {
      locations[locationIndex].isCompleted = true;
      locations[locationIndex].completedAt = new Date();
      
      const newGameState: GameState = {
        ...currentGameState,
        currentLocationIndex: currentGameState.currentLocationIndex + 1,
        score: currentGameState.score + 100
      };

      // Check if game is completed
      if (newGameState.currentLocationIndex >= locations.length) {
        newGameState.endTime = new Date();
        newGameState.totalTime = newGameState.endTime.getTime() - newGameState.startTime!.getTime();
        newGameState.isStarted = false;
      }

      this.locationsSubject.next([...locations]);
      this.gameStateSubject.next(newGameState);
      
      return true;
    }
    
    return false;
  }

  getCurrentLocation(): TreasureLocation | null {
    const gameState = this.gameStateSubject.value;
    const locations = this.locationsSubject.value;
    
    if (gameState.currentLocationIndex < locations.length) {
      return locations[gameState.currentLocationIndex];
    }
    
    return null;
  }

  getAllLocations(): TreasureLocation[] {
    return this.locationsSubject.value;
  }

  resetGame(): void {
    this.univaliLocations.forEach(location => {
      location.isCompleted = false;
      location.completedAt = undefined;
    });
    
    this.locationsSubject.next([...this.univaliLocations]);
    this.gameStateSubject.next({
      isStarted: false,
      currentLocationIndex: 0,
      score: 0,
      playerName: ''
    });
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in kilometers
    return d * 1000; // Convert to meters
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}
