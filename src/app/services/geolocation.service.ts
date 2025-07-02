import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';

export interface Position {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private currentPositionSubject = new BehaviorSubject<Position | null>(null);
  private watchId: string | number | null = null;
  private isWeb = Capacitor.getPlatform() === 'web';
  
  public currentPosition$ = this.currentPositionSubject.asObservable();

  constructor() {}
  async requestPermissions(): Promise<boolean> {
    try {
      if (this.isWeb) {
        // Para web, verificar se a geolocalização está disponível
        if (!navigator.geolocation) {
          console.error('Geolocalização não é suportada neste navegador');
          return false;
        }
        
        // No web, a permissão é solicitada automaticamente quando getCurrentPosition é chamado
        // Vamos testar se conseguimos obter a posição
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            (error) => {
              console.error('Erro ao verificar permissões de geolocalização:', error);
              resolve(false);
            },
            { timeout: 5000 }
          );
        });
      } else {
        // Para dispositivos móveis, usar Capacitor
        const permissions = await Geolocation.requestPermissions();
        return permissions.location === 'granted';
      }
    } catch (error) {
      console.error('Erro ao solicitar permissões de localização:', error);
      return false;
    }
  }
  async getCurrentPosition(): Promise<Position | null> {
    try {
      if (this.isWeb) {
        // Para web, usar a API nativa do navegador
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocalização não é suportada neste navegador'));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const currentPos: Position = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp
              };

              this.currentPositionSubject.next(currentPos);
              resolve(currentPos);
            },
            (error) => {
              console.error('Erro ao obter posição atual:', error);
              reject(error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000
            }
          );
        });
      } else {
        // Para dispositivos móveis, usar Capacitor
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000
        });

        const currentPos: Position = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        this.currentPositionSubject.next(currentPos);
        return currentPos;
      }
    } catch (error) {
      console.error('Erro ao obter posição atual:', error);
      return null;
    }
  }
  async startWatchingPosition(): Promise<void> {
    try {
      if (this.watchId) {
        await this.stopWatchingPosition();
      }

      if (this.isWeb) {
        // Para web, usar a API nativa do navegador
        if (!navigator.geolocation) {
          console.error('Geolocalização não é suportada neste navegador');
          return;
        }

        this.watchId = navigator.geolocation.watchPosition(
          (position) => {
            const currentPos: Position = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            };
            
            this.currentPositionSubject.next(currentPos);
          },
          (error) => {
            console.error('Erro no watch position:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      } else {
        // Para dispositivos móveis, usar Capacitor
        this.watchId = await Geolocation.watchPosition({
          enableHighAccuracy: true,
          timeout: 10000
        }, (position, err) => {
          if (err) {
            console.error('Erro no watch position:', err);
            return;
          }

          if (position) {
            const currentPos: Position = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            };
            
            this.currentPositionSubject.next(currentPos);
          }
        });
      }
    } catch (error) {
      console.error('Erro ao iniciar monitoramento de posição:', error);
    }
  }
  async stopWatchingPosition(): Promise<void> {
    if (this.watchId) {
      try {
        if (this.isWeb) {
          // Para web, usar a API nativa do navegador
          navigator.geolocation.clearWatch(this.watchId as number);
        } else {
          // Para dispositivos móveis, usar Capacitor
          await Geolocation.clearWatch({ id: this.watchId as string });
        }
        this.watchId = null;
      } catch (error) {
        console.error('Erro ao parar monitoramento de posição:', error);
      }
    }
  }

  // Para simulação durante desenvolvimento
  simulatePosition(latitude: number, longitude: number): void {
    const simulatedPos: Position = {
      latitude,
      longitude,
      accuracy: 5,
      timestamp: Date.now()
    };
    
    this.currentPositionSubject.next(simulatedPos);
  }
}
