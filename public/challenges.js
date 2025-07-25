// Challenges and Rewards System for AnonX Chat

class ChallengesSystem {
  constructor() {
    this.challenges = this.loadChallenges();
    this.userProgress = JSON.parse(localStorage.getItem('anonx_challenges') || '{}');
    this.initializeChallenges();
  }

  // Load all available challenges
  loadChallenges() {
    return [
      // Chat Count Challenges
      {
        id: 'first_chat',
        name: 'První pokec',
        description: 'Dokončit první chat',
        type: 'chat_count',
        target: 1,
        reward: { type: 'badge', name: 'Nováček', emoji: '🌱' },
        points: 10
      },
      {
        id: 'chat_veteran',
        name: 'Veterán chatů',
        description: 'Dokončit 10 chatů',
        type: 'chat_count',
        target: 10,
        reward: { type: 'badge', name: 'Veterán', emoji: '🎖️' },
        points: 50
      },
      {
        id: 'chat_master',
        name: 'Mistr konverzace',
        description: 'Dokončit 50 chatů',
        type: 'chat_count',
        target: 50,
        reward: { type: 'theme', name: 'Gold Theme', colors: { primary: '#ffd700' } },
        points: 200
      },

      // Rating Challenges
      {
        id: 'three_hearts',
        name: 'Tři srdíčka',
        description: 'Získat 3x ❤️ hodnocení',
        type: 'hearts',
        target: 3,
        reward: { type: 'badge', name: 'Milý', emoji: '💝' },
        points: 30
      },
      {
        id: 'heart_collector',
        name: 'Sběratel srdíček',
        description: 'Získat 15x ❤️ hodnocení',
        type: 'hearts',
        target: 15,
        reward: { type: 'animation', name: 'Heart Rain', effect: 'heart_rain' },
        points: 100
      },
      {
        id: 'beloved',
        name: 'Oblíbenec',
        description: 'Získat 30x ❤️ hodnocení',
        type: 'hearts',
        target: 30,
        reward: { type: 'emoji', name: 'Special Hearts', emojis: ['💖', '💕', '💗'] },
        points: 200
      },

      // Clean Chat Challenges
      {
        id: 'clean_five',
        name: 'Čistý záznam',
        description: 'Dokončit 5 chatů bez 💩',
        type: 'clean_chats',
        target: 5,
        reward: { type: 'badge', name: 'Čistý', emoji: '✨' },
        points: 40
      },
      {
        id: 'pure_soul',
        name: 'Čistá duše',
        description: 'Dokončit 20 chatů bez 💩',
        type: 'clean_chats',
        target: 20,
        reward: { type: 'theme', name: 'Pure Theme', colors: { primary: '#ffffff' } },
        points: 150
      },

      // Theme Challenges
      {
        id: 'phantom_user',
        name: 'Fantom uživatel',
        description: 'Dokončit 5 chatů v Phantom módu',
        type: 'theme_usage',
        target: 5,
        theme: 'phantom',
        reward: { type: 'badge', name: 'Fantom', emoji: '👻' },
        points: 35
      },
      {
        id: 'glow_enthusiast',
        name: 'Glow nadšenec',
        description: 'Dokončit 5 chatů v Glow módu',
        type: 'theme_usage',
        target: 5,
        theme: 'glow',
        reward: { type: 'badge', name: 'Zářivý', emoji: '✨' },
        points: 35
      },

      // Streak Challenges
      {
        id: 'daily_chatter',
        name: 'Denní povídálek',
        description: 'Dosáhnout 3denního streaku',
        type: 'streak',
        target: 3,
        reward: { type: 'badge', name: 'Věrný', emoji: '🔥' },
        points: 60
      },
      {
        id: 'week_warrior',
        name: 'Týdenní bojovník',
        description: 'Dosáhnout 7denního streaku',
        type: 'streak',
        target: 7,
        reward: { type: 'animation', name: 'Streak Fire', effect: 'streak_fire' },
        points: 150
      },

      // Time Challenges
      {
        id: 'quick_chat',
        name: 'Rychlý chat',
        description: 'Dokončit chat pod 2 minuty',
        type: 'chat_time',
        target: 120, // seconds
        condition: 'under',
        reward: { type: 'badge', name: 'Rychlý', emoji: '⚡' },
        points: 25
      },
      {
        id: 'deep_conversation',
        name: 'Hluboká konverzace',
        description: 'Vést chat déle než 15 minut',
        type: 'chat_time',
        target: 900, // seconds
        condition: 'over',
        reward: { type: 'badge', name: 'Hluboký', emoji: '🤔' },
        points: 75
      },

      // Special Challenges
      {
        id: 'night_owl',
        name: 'Noční sova',
        description: 'Chatovat mezi 22:00 - 6:00',
        type: 'time_period',
        startHour: 22,
        endHour: 6,
        reward: { type: 'badge', name: 'Noční sova', emoji: '🦉' },
        points: 30
      },
      {
        id: 'early_bird',
        name: 'Ranní ptáče',
        description: 'Chatovat mezi 5:00 - 8:00',
        type: 'time_period',
        startHour: 5,
        endHour: 8,
        reward: { type: 'badge', name: 'Ranní ptáče', emoji: '🐦' },
        points: 40
      },

      // Social Challenges
      {
        id: 'karma_keeper',
        name: 'Strážce karmy',
        description: 'Udržet pozitivní karmu (70%+ ❤️)',
        type: 'karma_ratio',
        target: 0.7,
        reward: { type: 'badge', name: 'Strážce', emoji: '⚖️' },
        points: 100
      },
      {
        id: 'rating_giver',
        name: 'Hodnotitel',
        description: 'Ohodnotit 10 chatů',
        type: 'ratings_given',
        target: 10,
        reward: { type: 'badge', name: 'Kritik', emoji: '⭐' },
        points: 50
      },

      // Exploration Challenges
      {
        id: 'theme_explorer',
        name: 'Průzkumník témat',
        description: 'Vyzkoušet oba témata (Phantom + Glow)',
        type: 'themes_used',
        target: 2,
        reward: { type: 'badge', name: 'Průzkumník', emoji: '🗺️' },
        points: 45
      },
      {
        id: 'feature_tester',
        name: 'Tester funkcí',
        description: 'Použít všechny hlavní funkce',
        type: 'features_used',
        features: ['chat', 'skip', 'end', 'stats', 'theme_switch'],
        reward: { type: 'badge', name: 'Tester', emoji: '🧪' },
        points: 60
      },

      // Milestone Challenges
      {
        id: 'century_club',
        name: 'Klub stovky',
        description: 'Dokončit 100 chatů',
        type: 'chat_count',
        target: 100,
        reward: { type: 'theme', name: 'Century Gold', colors: { primary: '#ffdf00' } },
        points: 500
      },
      {
        id: 'karma_legend',
        name: 'Legenda karmy',
        description: 'Získat 100x ❤️ hodnocení',
        type: 'hearts',
        target: 100,
        reward: { type: 'animation', name: 'Legend Aura', effect: 'legend_aura' },
        points: 1000
      }
    ];
  }

  // Initialize challenge progress tracking
  initializeChallenges() {
    this.challenges.forEach(challenge => {
      if (!this.userProgress[challenge.id]) {
        this.userProgress[challenge.id] = {
          progress: 0,
          completed: false,
          completedAt: null,
          unlocked: true
        };
      }
    });
    this.saveProgress();
  }

  // Check if challenge is completed
  checkChallenge(challengeId, currentValue) {
    const challenge = this.challenges.find(c => c.id === challengeId);
    const progress = this.userProgress[challengeId];
    
    if (!challenge || progress.completed) return false;

    let completed = false;
    
    switch (challenge.type) {
      case 'chat_count':
      case 'hearts':
      case 'clean_chats':
      case 'streak':
      case 'ratings_given':
        completed = currentValue >= challenge.target;
        break;
      case 'chat_time':
        if (challenge.condition === 'under') {
          completed = currentValue <= challenge.target;
        } else {
          completed = currentValue >= challenge.target;
        }
        break;
      case 'karma_ratio':
        completed = currentValue >= challenge.target;
        break;
      // Add more challenge type checks as needed
    }

    if (completed && !progress.completed) {
      progress.completed = true;
      progress.completedAt = new Date().toISOString();
      this.saveProgress();
      this.showChallengeCompleted(challenge);
      return true;
    }

    progress.progress = currentValue;
    this.saveProgress();
    return false;
  }

  // Update challenge progress based on user actions
  updateChallengeProgress(action, data = {}) {
    const stats = JSON.parse(localStorage.getItem('anonx_stats') || '{}');
    
    switch (action) {
      case 'chat_completed':
        this.checkChallenge('first_chat', stats.totalChats);
        this.checkChallenge('chat_veteran', stats.totalChats);
        this.checkChallenge('chat_master', stats.totalChats);
        this.checkChallenge('century_club', stats.totalChats);
        
        // Check time-based challenges
        if (data.duration) {
          this.checkChallenge('quick_chat', data.duration);
          this.checkChallenge('deep_conversation', data.duration);
        }
        
        // Check theme usage
        if (data.theme) {
          const themeUsage = this.getThemeUsage(data.theme);
          this.checkChallenge(data.theme === 'phantom' ? 'phantom_user' : 'glow_enthusiast', themeUsage);
        }
        
        // Check time period
        const hour = new Date().getHours();
        if ((hour >= 22 || hour < 6)) {
          this.checkChallenge('night_owl', 1);
        }
        if (hour >= 5 && hour <= 8) {
          this.checkChallenge('early_bird', 1);
        }
        break;
        
      case 'rating_given':
        const totalRatings = stats.heartCount + stats.poopCount + stats.ghostCount;
        this.checkChallenge('rating_giver', totalRatings);
        
        if (data.rating === 'heart') {
          this.checkChallenge('three_hearts', stats.heartCount);
          this.checkChallenge('heart_collector', stats.heartCount);
          this.checkChallenge('beloved', stats.heartCount);
          this.checkChallenge('karma_legend', stats.heartCount);
        }
        
        // Check karma ratio
        if (totalRatings > 0) {
          const karmaRatio = stats.heartCount / (stats.heartCount + stats.poopCount);
          this.checkChallenge('karma_keeper', karmaRatio);
        }
        break;
        
      case 'streak_updated':
        this.checkChallenge('daily_chatter', data.streak);
        this.checkChallenge('week_warrior', data.streak);
        break;
    }
  }

  // Get theme usage count
  getThemeUsage(theme) {
    const themeUsage = JSON.parse(localStorage.getItem('anonx_theme_usage') || '{}');
    return themeUsage[theme] || 0;
  }

  // Track theme usage
  trackThemeUsage(theme) {
    const themeUsage = JSON.parse(localStorage.getItem('anonx_theme_usage') || '{}');
    themeUsage[theme] = (themeUsage[theme] || 0) + 1;
    localStorage.setItem('anonx_theme_usage', JSON.stringify(themeUsage));
  }

  // Show challenge completion notification
  showChallengeCompleted(challenge) {
    // Create and show challenge completion popup
    const popup = document.createElement('div');
    popup.className = 'challenge-popup';
    popup.innerHTML = `
      <div class="challenge-popup-content">
        <div class="challenge-emoji">${challenge.reward.emoji || '🏆'}</div>
        <div class="challenge-title">Výzva splněna!</div>
        <div class="challenge-name">${challenge.name}</div>
        <div class="challenge-reward">+${challenge.points} bodů</div>
        <div class="challenge-reward-desc">${this.getRewardDescription(challenge.reward)}</div>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    // Animate and remove
    setTimeout(() => popup.classList.add('show'), 100);
    setTimeout(() => {
      popup.classList.remove('show');
      setTimeout(() => document.body.removeChild(popup), 300);
    }, 4000);
    
    // Play completion sound if available
    if (window.createSound) {
      window.createSound(800, 0.2, 'sine');
      setTimeout(() => window.createSound(1000, 0.15, 'sine'), 150);
    }
  }

  // Get reward description
  getRewardDescription(reward) {
    switch (reward.type) {
      case 'badge':
        return `Získal jsi odznak: ${reward.name}`;
      case 'theme':
        return `Odemkl jsi nové téma: ${reward.name}`;
      case 'animation':
        return `Odemkl jsi animaci: ${reward.name}`;
      case 'emoji':
        return `Odemkl jsi nové emoji: ${reward.emojis.join(' ')}`;
      default:
        return 'Speciální odměna odemčena!';
    }
  }

  // Get completed challenges
  getCompletedChallenges() {
    return this.challenges.filter(challenge => 
      this.userProgress[challenge.id]?.completed
    );
  }

  // Get available challenges
  getAvailableChallenges() {
    return this.challenges.filter(challenge => 
      !this.userProgress[challenge.id]?.completed
    );
  }

  // Get total points earned
  getTotalPoints() {
    return this.getCompletedChallenges().reduce((total, challenge) => 
      total + challenge.points, 0
    );
  }

  // Save progress to localStorage
  saveProgress() {
    localStorage.setItem('anonx_challenges', JSON.stringify(this.userProgress));
  }

  // Get challenge progress for display
  getChallengeProgress(challengeId) {
    const challenge = this.challenges.find(c => c.id === challengeId);
    const progress = this.userProgress[challengeId];
    
    if (!challenge || !progress) return null;
    
    return {
      ...challenge,
      ...progress,
      percentage: Math.min((progress.progress / challenge.target) * 100, 100)
    };
  }
}

// Initialize challenges system
window.challengesSystem = new ChallengesSystem();