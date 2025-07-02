# Caça ao Tesouro Univali 🏆

Um aplicativo móvel interativo de caça ao tesouro desenvolvido para o campus da Univali, utilizando geolocalização e mapas para uma experiência imersiva de exploração.

## 📱 Sobre o Projeto

O **Caça ao Tesouro Univali** é um jogo móvel que desafia os jogadores a encontrar locais específicos no campus da Universidade do Vale do Itajaí (Univali) seguindo pistas e utilizando GPS. O aplicativo combina diversão, exploração e tecnologia para criar uma experiência única de descoberta do campus universitário.

## ✨ Funcionalidades

### 🎮 Gameplay

- **Sistema de Pistas**: Cada local possui uma pista enigmática e uma dica adicional
- **Geolocalização GPS**: Verificação automática da proximidade com os locais
- **Progresso em Tempo Real**: Acompanhamento do tempo decorrido e pontuação
- **Sistema de Pontuação**: 100 pontos por local encontrado
- **Múltiplas Localizações**: 8 locais únicos no campus da Univali

### 🗺️ Recursos de Mapa

- **Mapa Interativo**: Visualização completa com todos os locais
- **Marcadores Inteligentes**: Diferentes cores para locais pendentes, atual e concluídos
- **Mapa Desktop**: Versão expandida para computadores com legenda detalhada
- **Localização em Tempo Real**: Rastreamento da posição atual do jogador

### 🎯 Locais Incluídos

1. **Biblioteca Central** - O coração do conhecimento
2. **Reitoria** - Centro das decisões importantes
3. **Laboratório de Informática** - Onde a tecnologia ganha vida
4. **Quadra Esportiva** - Espaço para atividades físicas
5. **Cantina Universitária** - Ponto de encontro gastronômico
6. **Auditório Principal** - Palco de grandes eventos
7. **Estacionamento Principal** - Área de estacionamento
8. **Praça Central** - Coração do campus

## 🛠️ Tecnologias Utilizadas

- **[Ionic Framework](https://ionicframework.com/)** - Framework híbrido para aplicações móveis
- **[Angular](https://angular.io/)** - Framework TypeScript para desenvolvimento web
- **[Capacitor](https://capacitorjs.com/)** - Runtime nativo para aplicações web
- **[Leaflet](https://leafletjs.com/)** - Biblioteca para mapas interativos
- **[Capacitor Geolocation](https://capacitorjs.com/docs/apis/geolocation)** - API de geolocalização
- **[RxJS](https://rxjs.dev/)** - Biblioteca para programação reativa

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter as seguintes ferramentas instaladas:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Ionic CLI**

### Instalação das Ferramentas

```bash
# Instalar Node.js (baixar do site oficial)
# https://nodejs.org/

# Instalar Ionic CLI
npm install -g @ionic/cli
```

## 🚀 Instalação e Execução

### 1. Clonar o Repositório

```bash
git clone https://github.com/MatheusHMafra/trabalho-m3-caca-tesouro.git
cd trabalho-m3-caca-tesouro
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Executar em Modo Desenvolvimento

```bash
# Executar no navegador
ionic serve
```

ou

```bash
ng serve
```

ou

```bash
npx -y ng serve
```

### 4. Executar em Dispositivo Móvel

```bash
# Adicionar plataforma Android
ionic capacitor add android

# Adicionar plataforma iOS
ionic capacitor add ios

# Sincronizar código
ionic capacitor sync

# Executar no dispositivo
ionic capacitor run android
ionic capacitor run ios
```

## 📱 Como Jogar

### Início do Jogo

1. **Digite seu nome** no campo de entrada
2. **Clique em "Iniciar Caça ao Tesouro"**
3. **Permita o acesso à localização** quando solicitado

### Durante o Jogo

1. **Leia a pista** do local atual
2. **Use a dica** se necessário (botão "Ver Dica")
3. **Navegue até o local** usando o mapa ou seguindo as pistas
4. **Confirme sua localização** quando estiver próximo (< 5 metros)
5. **Continue para o próximo local** após a confirmação

### Recursos Adicionais

- **Mapa Interativo**: Visualize todos os locais e sua posição atual
- **Acompanhamento de Progresso**: Veja tempo decorrido e pontuação
- **Modo Desktop**: Versão ampliada para computadores

## 🔧 Desenvolvimento

### Estrutura do Projeto

```txt
src/
├── app/
│   ├── home/                 # Página principal do jogo
│   │   ├── home.page.ts     # Lógica do componente
│   │   ├── home.page.html   # Template HTML
│   │   └── home.page.scss   # Estilos CSS
│   ├── services/            # Serviços da aplicação
│   │   ├── treasure-hunt.service.ts  # Lógica do jogo
│   │   └── geolocation.service.ts    # Serviço de geolocalização
│   ├── app.component.ts     # Componente raiz
│   └── app.routes.ts        # Configuração de rotas
├── assets/                  # Recursos estáticos
├── environments/            # Configurações de ambiente
└── index.html              # HTML principal
```

### Modo Debug

O aplicativo inclui um modo debug para desenvolvimento:

```typescript
isDebugMode: boolean = true;
```

**Funcionalidades do Debug:**

- **Simulação de Localização**: Simula a posição atual no local alvo
- **Logs Detalhados**: Informações de depuração no console
- **Bypass de Distância**: Permite testar sem estar fisicamente no local

### Personalização

#### Adicionar Novos Locais

```typescript
// Em treasure-hunt.service.ts
private univaliLocations: TreasureLocation[] = [
  {
    id: 9,
    name: 'Novo Local',
    latitude: -26.914000,
    longitude: -48.663000,
    clue: 'Sua pista aqui',
    hint: 'Sua dica aqui',
    description: 'Descrição do local',
    isCompleted: false
  }
];
```

## 📊 Funcionalidades Técnicas

### Geolocalização

- **Precisão Alta**: Configuração para máxima precisão GPS
- **Fallback Web**: Suporte para navegadores web
- **Monitoramento Contínuo**: Atualização automática da posição
- **Tratamento de Erros**: Handling robusto de falhas de GPS

### Persistência de Dados

- **Estado do Jogo**: Mantido em memória durante a sessão
- **Progresso**: Acompanhamento em tempo real
- **Reactive Programming**: Uso de RxJS para gerenciamento de estado

### Responsividade

- **Mobile First**: Otimizado para dispositivos móveis
- **Desktop Compatible**: Versão adaptada para computadores
- **Cross-Platform**: Funciona em Android, iOS e Web

## 🎨 Customização Visual

### Temas

O aplicativo utiliza variáveis CSS do Ionic para personalização:

```scss
// Em variables.scss
:root {
  --ion-color-primary: #3880ff;
  --ion-color-secondary: #3dc2ff;
  --ion-color-tertiary: #5260ff;
}
```

### Ícones

Utiliza a biblioteca Ionicons para consistência visual:

```typescript
import { map, play, trophy, location } from 'ionicons/icons';
```

## 📈 Métricas e Analytics

### Dados Coletados

- **Tempo de Jogo**: Duração total da sessão
- **Pontuação**: Baseada em locais encontrados
- **Progresso**: Porcentagem de conclusão
- **Localização**: Apenas para verificação de proximidade

### Privacidade

- **Dados Locais**: Nenhum dado é enviado para servidores externos
- **Geolocalização**: Usada apenas para verificação de proximidade
- **Anonimato**: Nomes dos jogadores não são armazenados persistentemente

## 🤝 Contribuindo

### Como Contribuir

1. **Fork** o repositório
2. **Crie uma branch** para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. **Abra um Pull Request**

### Padrões de Código

- **TypeScript**: Tipagem estrita habilitada
- **ESLint**: Configuração padrão do Angular
- **Prettier**: Formatação automática de código
- **Conventional Commits**: Padrão para mensagens de commit

## 🐛 Solução de Problemas

### Problemas Comuns

#### GPS não funciona

```bash
# Verificar permissões
ionic capacitor run android --list
```

#### Mapa não carrega

```bash
# Verificar se o Leaflet está instalado
npm list leaflet
```

#### Erro de build

```bash
# Limpar cache e reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Logs de Debug

```typescript
// Habilitar logs detalhados
console.log('Debug:', objeto);
```

## 📄 Licença

Este projeto está sob a licença Creative Commons. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Matheus Mafra** - Desenvolvedor Principal
- **Bruno Dias** - Desenvolvedor Colaborador

Desenvolvido como projeto acadêmico para a disciplina de Dispositivos Móveis da Univali.

---

**Univali - Caça ao Tesouro** 🏆  
*Explorando o campus através da tecnologia*
