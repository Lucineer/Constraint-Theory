// Tutorial System Core
class TutorialSystem {
  constructor() {
    this.currentTutorial = null;
    this.currentStep = 0;
    this.progress = this.loadProgress();
    this.achievements = this.loadAchievements();
  }

  // Initialize the tutorial system
  async init() {
    await this.loadTutorialData();
    this.setupEventListeners();
    this.updateProgressDisplay();
  }

  // Load tutorial metadata
  async loadTutorialData() {
    const response = await fetch('/tutorials/data/tutorials.json');
    const data = await response.json();
    this.tutorials = data.tutorials;
    this.achievementDefinitions = data.progressTracking.achievements;
  }

  // Load specific tutorial content
  async loadTutorialContent(tutorialId) {
    const response = await fetch(`/tutorials/data/${tutorialId}.json`);
    return await response.json();
  }

  // Start a tutorial
  async startTutorial(tutorialId) {
    this.currentTutorial = await this.loadTutorialContent(tutorialId);
    this.currentStep = this.getTutorialProgress(tutorialId) || 0;
    this.renderTutorial();
    this.updateProgressDisplay();
  }

  // Navigate to a specific step
  goToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < this.currentTutorial.steps.length) {
      this.currentStep = stepIndex;
      this.renderTutorial();
      this.saveTutorialProgress(this.currentTutorial.id, stepIndex);
      this.updateProgressDisplay();
    }
  }

  // Next step
  nextStep() {
    if (this.currentStep < this.currentTutorial.steps.length - 1) {
      this.goToStep(this.currentStep + 1);
    }
  }

  // Previous step
  previousStep() {
    if (this.currentStep > 0) {
      this.goToStep(this.currentStep - 1);
    }
  }

  // Render the current tutorial
  renderTutorial() {
    const tutorial = this.currentTutorial;
    const step = tutorial.steps[this.currentStep];

    // Update header
    document.title = `${step.title} - ${tutorial.title} - Constraint Theory`;

    // Render navigation
    this.renderTutorialNav();

    // Render current step
    this.renderStep(step);

    // Render progress
    this.renderProgress();

    // Scroll to top
    window.scrollTo(0, 0);
  }

  // Render tutorial navigation
  renderTutorialNav() {
    const navContainer = document.getElementById('tutorial-nav');
    if (!navContainer) return;

    const tutorial = this.currentTutorial;
    const completedSteps = this.getTutorialProgress(tutorial.id) || 0;

    navContainer.innerHTML = `
      <div class="tutorial-nav-section">
        <h4>Steps (${this.currentStep + 1}/${tutorial.steps.length})</h4>
        <ul class="tutorial-nav-list">
          ${tutorial.steps.map((step, index) => `
            <li class="tutorial-nav-item ${index === this.currentStep ? 'active' : ''} ${index <= completedSteps ? 'completed' : ''}"
                onclick="tutorialSystem.goToStep(${index})">
              <span class="step-number">${index + 1}</span>
              <span class="step-title">${step.title}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      <div class="tutorial-nav-section">
        <h4>Progress</h4>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${((this.currentStep + 1) / tutorial.steps.length) * 100}%"></div>
        </div>
        <div class="progress-text">${Math.round(((this.currentStep + 1) / tutorial.steps.length) * 100)}% complete</div>
      </div>
    `;
  }

  // Render current step content
  renderStep(step) {
    const contentContainer = document.getElementById('tutorial-content');
    if (!contentContainer) return;

    contentContainer.innerHTML = `
      <div class="tutorial-step">
        <div class="tutorial-step-header">
          <div class="step-number">${this.currentStep + 1}</div>
          <h1 class="tutorial-step-title">${step.title}</h1>
        </div>
        <div class="tutorial-step-content">
          ${this.renderStepContent(step.content)}
        </div>
        ${step.codeExample ? this.renderCodeExample(step.codeExample) : ''}
        ${step.interactiveExercise ? this.renderInteractiveExercise(step.interactiveExercise) : ''}
        ${step.quiz ? this.renderQuiz(step.quiz) : ''}
      </div>
      <div class="tutorial-navigation">
        <button class="nav-button" onclick="tutorialSystem.previousStep()" ${this.currentStep === 0 ? 'disabled' : ''}>
          ← Previous
        </button>
        <button class="nav-button" onclick="tutorialSystem.nextStep()" ${this.currentStep === this.currentTutorial.steps.length - 1 ? 'disabled' : ''}>
          Next →
        </button>
      </div>
    `;

    // Render math equations
    this.renderMath();
  }

  // Render step content with markdown-like processing
  renderStepContent(content) {
    // Convert markdown-style syntax to HTML
    let html = content
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Equations
      .replace(/\$\$([^$]+)\$\$/g, '<div class="equation">$1</div>')
      .replace(/\$([^$]+)\$/g, '<span class="equation-inline">$1</span>')
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      // Lists
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[a-z])/gm, '<p>')
      .replace(/(?<!>)$/gm, '</p>');

    // Wrap lists
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

    // Clean up nested paragraph tags
    html = html.replace(/<p>(<h[1-3]>)/g, '$1');
    html = html.replace(/(<\/h[1-3]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<blockquote>)/g, '$1');
    html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
    html = html.replace(/<p>(<div class="equation">)/g, '$1');
    html = html.replace(/(<\/div>)<\/p>/g, '$1');

    // Clean up multiple consecutive tags
    html = html.replace(/<\/p><p>/g, '</p>\n<p>');

    return html;
  }

  // Render code example
  renderCodeExample(example) {
    return `
      <div class="code-example">
        <div class="code-example-header">
          <span class="code-example-language">${example.language}</span>
          <button class="code-example-copy" onclick="tutorialSystem.copyCode(this)">
            Copy
          </button>
        </div>
        <div class="code-example-content">
          <pre><code class="language-${example.language}">${this.escapeHtml(example.code)}</code></pre>
        </div>
        ${example.description ? `<p class="text-sm text-gray-400 mt-2">${example.description}</p>` : ''}
      </div>
    `;
  }

  // Render interactive exercise
  renderInteractiveExercise(exercise) {
    return `
      <div class="interactive-exercise" data-exercise-id="${exercise.prompt.substring(0, 20)}">
        <div class="exercise-header">
          <h4>Interactive Exercise</h4>
        </div>
        <p class="exercise-prompt">${exercise.prompt}</p>
        ${exercise.initialCode ? `
          <div class="exercise-editor">
            <textarea id="exercise-code">${exercise.initialCode}</textarea>
          </div>
          <div class="exercise-actions">
            <button class="exercise-button exercise-button-primary" onclick="tutorialSystem.checkExercise()">
              Check Answer
            </button>
            <button class="exercise-button exercise-button-secondary" onclick="tutorialSystem.showSolution()">
              Show Solution
            </button>
            <button class="exercise-button exercise-button-secondary" onclick="tutorialSystem.resetExercise()">
              Reset
            </button>
          </div>
          <div class="exercise-feedback" id="exercise-feedback"></div>
        ` : ''}
        ${exercise.type === 'exploration' ? `
          <textarea class="w-full bg-gray-800 text-white p-4 rounded border border-gray-700 mt-4"
                    placeholder="Write your observations here..."
                    rows="4"></textarea>
        ` : ''}
      </div>
    `;
  }

  // Render quiz
  renderQuiz(quiz) {
    return `
      <div class="quiz-section">
        <h3>Quiz</h3>
        <p class="quiz-question-text">${quiz.question}</p>
        <div class="quiz-options">
          ${quiz.options.map((option, index) => `
            <div class="quiz-option" onclick="tutorialSystem.selectQuizOption(${index}, ${quiz.correct})">
              <div class="quiz-option-radio"></div>
              <span>${option}</span>
            </div>
          `).join('')}
        </div>
        ${quiz.explanation ? `
          <div class="quiz-explanation" style="display: none; margin-top: 1rem; padding: 1rem; background: var(--bg-tertiary); border-radius: 0.375rem;">
            <strong>Explanation:</strong> ${quiz.explanation}
          </div>
        ` : ''}
      </div>
    `;
  }

  // Render math equations with KaTeX
  renderMath() {
    if (typeof katex !== 'undefined') {
      document.querySelectorAll('.equation, .equation-inline').forEach(el => {
        try {
          katex.render(el.textContent, el, {
            throwOnError: false,
            displayMode: el.classList.contains('equation')
          });
        } catch (e) {
          console.error('KaTeX rendering error:', e);
        }
      });
    }
  }

  // Copy code to clipboard
  copyCode(button) {
    const codeBlock = button.closest('.code-example').querySelector('code');
    const code = codeBlock.textContent;

    navigator.clipboard.writeText(code).then(() => {
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    });
  }

  // Check exercise answer
  checkExercise() {
    const userCode = document.getElementById('exercise-code').value;
    const feedback = document.getElementById('exercise-feedback');

    // Simple check - compare with solution
    const step = this.currentTutorial.steps[this.currentStep];
    const exercise = step.interactiveExercise;

    if (exercise.solution) {
      // Normalize code for comparison
      const normalizedUserCode = this.normalizeCode(userCode);
      const normalizedSolution = this.normalizeCode(exercise.solution);

      if (normalizedUserCode === normalizedSolution) {
        feedback.className = 'exercise-feedback success';
        feedback.textContent = '✓ Correct! Well done.';
        feedback.style.display = 'block';

        // Update progress
        this.markExerciseComplete(this.currentTutorial.id, this.currentStep);
      } else {
        feedback.className = 'exercise-feedback error';
        feedback.textContent = '✗ Not quite right. Try again or click "Show Solution".';
        feedback.style.display = 'block';
      }
    }
  }

  // Show exercise solution
  showSolution() {
    const step = this.currentTutorial.steps[this.currentStep];
    const exercise = step.interactiveExercise;

    if (exercise.solution) {
      document.getElementById('exercise-code').value = exercise.solution;

      const feedback = document.getElementById('exercise-feedback');
      feedback.className = 'exercise-feedback success';
      feedback.textContent = 'This is the solution. Study it and try the next exercise!';
      feedback.style.display = 'block';
    }
  }

  // Reset exercise
  resetExercise() {
    const step = this.currentTutorial.steps[this.currentStep];
    const exercise = step.interactiveExercise;

    if (exercise.initialCode) {
      document.getElementById('exercise-code').value = exercise.initialCode;
    }

    const feedback = document.getElementById('exercise-feedback');
    feedback.style.display = 'none';
  }

  // Normalize code for comparison
  normalizeCode(code) {
    return code
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}();,:])\s*/g, '$1')
      .trim()
      .toLowerCase();
  }

  // Select quiz option
  selectQuizOption(selectedIndex, correctIndex) {
    const options = document.querySelectorAll('.quiz-option');
    const explanation = document.querySelector('.quiz-explanation');

    options.forEach((option, index) => {
      option.classList.remove('selected', 'correct', 'incorrect');

      if (index === selectedIndex) {
        option.classList.add('selected');

        if (index === correctIndex) {
          option.classList.add('correct');
          if (explanation) explanation.style.display = 'block';

          // Mark quiz complete
          this.markQuizComplete(this.currentTutorial.id, this.currentStep);
        } else {
          option.classList.add('incorrect');
        }
      }
    });
  }

  // Render progress display
  renderProgress() {
    const progressContainer = document.getElementById('tutorial-progress');
    if (!progressContainer) return;

    const tutorial = this.currentTutorial;
    const progress = ((this.currentStep + 1) / tutorial.steps.length) * 100;

    progressContainer.innerHTML = `
      <div class="progress-bar-container">
        <div class="progress-bar-fill" style="width: ${progress}%"></div>
      </div>
      <div class="progress-text">${Math.round(progress)}% complete</div>
    `;
  }

  // Update progress display
  updateProgressDisplay() {
    // Update main progress bar if exists
    const mainProgressBar = document.getElementById('main-progress-bar');
    const mainProgressText = document.getElementById('main-progress-text');

    if (mainProgressBar && mainProgressText) {
      const totalProgress = this.calculateTotalProgress();
      mainProgressBar.style.width = `${totalProgress}%`;
      mainProgressText.textContent = `${Math.round(totalProgress)}% complete`;
    }
  }

  // Calculate total progress across all tutorials
  calculateTotalProgress() {
    if (!this.tutorials || this.tutorials.length === 0) return 0;

    let totalSteps = 0;
    let completedSteps = 0;

    for (const tutorial of this.tutorials) {
      const tutorialProgress = this.getTutorialProgress(tutorial.id);
      totalSteps += tutorial.steps;
      completedSteps += tutorialProgress || 0;
    }

    return (completedSteps / totalSteps) * 100;
  }

  // Save tutorial progress
  saveTutorialProgress(tutorialId, step) {
    if (!this.progress[tutorialId]) {
      this.progress[tutorialId] = {
        currentStep: 0,
        completedSteps: [],
        exercises: {},
        quizzes: {}
      };
    }

    this.progress[tutorialId].currentStep = step;
    this.progress[tutorialId].completedSteps = Array.from(
      { length: step + 1 },
      (_, i) => i
    );

    this.saveProgress();
  }

  // Get tutorial progress
  getTutorialProgress(tutorialId) {
    return this.progress[tutorialId]?.currentStep || 0;
  }

  // Mark exercise complete
  markExerciseComplete(tutorialId, stepIndex) {
    if (!this.progress[tutorialId]) return;

    this.progress[tutorialId].exercises[stepIndex] = true;
    this.saveProgress();
    this.checkAchievements();
  }

  // Mark quiz complete
  markQuizComplete(tutorialId, stepIndex) {
    if (!this.progress[tutorialId]) return;

    this.progress[tutorialId].quizzes[stepIndex] = true;
    this.saveProgress();
    this.checkAchievements();
  }

  // Mark tutorial complete
  markTutorialComplete(tutorialId) {
    if (!this.progress[tutorialId]) return;

    this.progress[tutorialId].completed = true;
    this.progress[tutorialId].completedAt = new Date().toISOString();
    this.saveProgress();
    this.checkAchievements();
  }

  // Save progress to localStorage
  saveProgress() {
    localStorage.setItem('constraintTheory_tutorial_progress', JSON.stringify(this.progress));
  }

  // Load progress from localStorage
  loadProgress() {
    const saved = localStorage.getItem('constraintTheory_tutorial_progress');
    return saved ? JSON.parse(saved) : {};
  }

  // Load achievements from localStorage
  loadAchievements() {
    const saved = localStorage.getItem('constraintTheory_achievements');
    return saved ? JSON.parse(saved) : [];
  }

  // Save achievements to localStorage
  saveAchievements() {
    localStorage.setItem('constraintTheory_achievements', JSON.stringify(this.achievements));
  }

  // Check for new achievements
  checkAchievements() {
    for (const achievement of this.achievementDefinitions) {
      if (!this.achievements.includes(achievement.id)) {
        if (this.hasEarnedAchievement(achievement)) {
          this.unlockAchievement(achievement);
        }
      }
    }
  }

  // Check if achievement is earned
  hasEarnedAchievement(achievement) {
    switch (achievement.id) {
      case 'first_tutorial':
        return Object.keys(this.progress).length > 0;

      case 'completionist':
        return this.tutorials &&
               this.tutorials.every(t => this.progress[t.id]?.completed);

      case 'perfect_score':
        return Object.values(this.progress).every(t => {
          const totalQuizzes = Object.keys(t.quizzes || {}).length;
          const totalExercises = Object.keys(t.exercises || {}).length;
          return totalQuizzes > 0 && totalExercises > 0;
        });

      case 'explorer':
        return this.tutorials &&
               this.tutorials.every(t => this.progress[t.id]?.currentStep > 0);

      default:
        return false;
    }
  }

  // Unlock achievement
  unlockAchievement(achievement) {
    this.achievements.push(achievement.id);
    this.saveAchievements();
    this.showAchievementNotification(achievement);
  }

  // Show achievement notification
  showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-content">
        <h4>Achievement Unlocked!</h4>
        <p>${achievement.title}: ${achievement.description}</p>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Setup event listeners
  setupEventListeners() {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.currentTutorial) return;

      if (e.key === 'ArrowLeft' && !e.shiftKey) {
        e.preventDefault();
        this.previousStep();
      } else if (e.key === 'ArrowRight' && !e.shiftKey) {
        e.preventDefault();
        this.nextStep();
      }
    });
  }

  // Get certificate for completed tutorial
  getCertificate(tutorialId) {
    const tutorialProgress = this.progress[tutorialId];
    if (!tutorialProgress?.completed) return null;

    const tutorial = this.tutorials.find(t => t.id === tutorialId);
    if (!tutorial) return null;

    return {
      tutorial: tutorial.title,
      completedAt: new Date(tutorialProgress.completedAt).toLocaleDateString(),
      steps: tutorial.steps
    };
  }
}

// Initialize tutorial system
const tutorialSystem = new TutorialSystem();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => tutorialSystem.init());
} else {
  tutorialSystem.init();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TutorialSystem;
}
