/**
 * Lightweight sentiment analysis using lexicon-based approach
 * No external dependencies - completely client-side
 */
class SentimentAnalyzer {
  constructor() {
    this.positiveWords = new Set([
      'amazing', 'awesome', 'brilliant', 'excellent', 'fantastic', 'great', 'incredible',
      'love', 'perfect', 'wonderful', 'outstanding', 'superb', 'magnificent', 'marvelous',
      'good', 'nice', 'beautiful', 'cool', 'fun', 'happy', 'joy', 'best', 'favorite',
      'impressive', 'stunning', 'remarkable', 'extraordinary', 'phenomenal', 'terrific',
      'delightful', 'charming', 'lovely', 'gorgeous', 'splendid', 'divine', 'brilliant',
      'fabulous', 'glorious', 'heavenly', 'ideal', 'magnificent', 'perfect', 'precious',
      'spectacular', 'sublime', 'superb', 'supreme', 'ultimate', 'adorable', 'amazing',
      'appreciate', 'approved', 'attractive', 'beautiful', 'benefit', 'bliss', 'bless',
      'brave', 'calm', 'celebrate', 'champion', 'cheer', 'clever', 'comfort', 'complete',
      'confident', 'creative', 'cute', 'dazzle', 'delight', 'dream', 'easy', 'elegant',
      'enjoy', 'enthusiasm', 'epic', 'exciting', 'faith', 'fancy', 'flawless', 'flourish',
      'fresh', 'genius', 'glad', 'grace', 'grateful', 'harmony', 'heal', 'hilarious',
      'honest', 'hope', 'hug', 'inspire', 'kind', 'laugh', 'luxury', 'magical',
      'miracle', 'nice', 'optimistic', 'paradise', 'peace', 'pleasure', 'proud',
      'radiant', 'refresh', 'relax', 'relief', 'respect', 'reward', 'rich', 'safe',
      'satisfy', 'secure', 'shine', 'smile', 'smooth', 'special', 'success', 'sunny',
      'sweet', 'thanks', 'thrill', 'treasure', 'triumph', 'trust', 'value', 'victory',
      'warm', 'welcome', 'wise', 'wow', 'yes', 'yay', 'yeah'
    ]);

    this.negativeWords = new Set([
      'awful', 'bad', 'terrible', 'horrible', 'hate', 'disgusting', 'worst', 'stupid',
      'annoying', 'boring', 'disappointing', 'fail', 'failure', 'garbage', 'lame',
      'pathetic', 'ridiculous', 'suck', 'trash', 'ugly', 'useless', 'waste', 'weak',
      'wrong', 'broken', 'confusing', 'crazy', 'creepy', 'cruel', 'dangerous', 'dead',
      'difficult', 'dirty', 'disaster', 'disease', 'disturbing', 'dumb', 'evil',
      'fake', 'false', 'fear', 'fight', 'gross', 'guilty', 'harm', 'hurt', 'ignore',
      'impossible', 'kill', 'lie', 'lost', 'mad', 'mess', 'mistake', 'nasty', 'never',
      'no', 'noise', 'pain', 'panic', 'pathetic', 'poison', 'problem', 'reject',
      'revenge', 'rude', 'sad', 'scary', 'serious', 'shame', 'sick', 'slow', 'sorry',
      'stress', 'struggle', 'suffer', 'threat', 'tired', 'trouble', 'unfair', 'upset',
      'violence', 'war', 'worry', 'worse', 'enemy', 'angry', 'bitter', 'dark',
      'death', 'destroy', 'devil', 'doom', 'doubt', 'dump', 'emergency', 'explode',
      'fatal', 'fear', 'final', 'fire', 'force', 'funeral', 'ghost', 'greed',
      'hard', 'harsh', 'hate', 'hell', 'helpless', 'hopeless', 'hostile', 'ill',
      'insane', 'jealous', 'junk', 'kill', 'lazy', 'lonely', 'loud', 'negative',
      'nobody', 'nothing', 'old', 'poor', 'pressure', 'punk', 'quit', 'rough',
      'severe', 'shadow', 'shock', 'shut', 'silent', 'slave', 'sore', 'strange',
      'stupid', 'suck', 'sudden', 'suspicious', 'thick', 'ugly', 'unhappy', 'unknown',
      'victim', 'virus', 'warning', 'weak', 'weird', 'wild', 'wound'
    ]);

    this.intensifiers = new Set([
      'very', 'really', 'extremely', 'incredibly', 'absolutely', 'totally',
      'completely', 'quite', 'rather', 'fairly', 'pretty', 'somewhat',
      'highly', 'deeply', 'truly', 'genuinely', 'particularly', 'especially',
      'remarkably', 'exceptionally', 'extraordinarily', 'tremendously', 'immensely'
    ]);

    this.negators = new Set([
      'not', 'no', 'never', 'nothing', 'nobody', 'nowhere', 'neither', 'nor',
      'none', 'without', 'lack', 'lacking', 'absent', 'hardly', 'scarcely',
      'barely', 'seldom', 'rarely', 'little', 'few', 'minus', 'cannot', 'cant',
      'wont', 'wouldnt', 'shouldnt', 'couldnt', 'doesnt', 'dont', 'isnt', 'arent',
      'wasnt', 'werent', 'hasnt', 'havent', 'hadnt', 'aint'
    ]);

    // Emoji sentiment mapping
    this.emojiSentiment = {
      '😀': 2, '😃': 2, '😄': 2, '😁': 2, '😆': 2, '😅': 1, '😂': 2, '🤣': 2,
      '😊': 2, '😇': 2, '🙂': 1, '🙃': 1, '😉': 1, '😌': 1, '😍': 2, '🥰': 2,
      '😘': 2, '😗': 1, '😙': 1, '😚': 1, '😋': 1, '😛': 1, '😝': 1, '😜': 1,
      '🤪': 1, '🤨': 0, '🧐': 0, '🤓': 1, '😎': 1, '🤩': 2, '🥳': 2, '😏': 0,
      '😒': -1, '😞': -2, '😔': -2, '😟': -2, '😕': -1, '🙁': -1, '☹️': -2,
      '😣': -2, '😖': -2, '😫': -2, '😩': -2, '🥺': -1, '😢': -2, '😭': -2,
      '😤': -1, '😠': -2, '😡': -2, '🤬': -2, '🤯': -1, '😳': 0, '🥵': -1,
      '🥶': -1, '😱': -2, '😨': -2, '😰': -2, '😥': -2, '😓': -1, '🤗': 1,
      '🤔': 0, '🤭': 1, '🤫': 0, '🤥': -1, '😶': 0, '😐': 0, '😑': -1,
      '😬': -1, '🙄': -1, '😯': 0, '😦': -1, '😧': -2, '😮': 0, '😲': 0,
      '🥱': -1, '😴': 0, '🤤': 0, '😪': -1, '😵': -2, '🤐': 0, '🥴': -1,
      '🤢': -2, '🤮': -2, '🤧': -1, '😷': -1, '🤒': -2, '🤕': -2, '🤑': 0,
      '🤠': 1, '😈': -1, '👿': -2, '👹': -2, '👺': -2, '🤡': 0, '💩': -2,
      '👻': 0, '💀': -2, '☠️': -2, '👽': 0, '👾': 0, '🤖': 0, '🎃': 0,
      '😺': 2, '😸': 2, '😹': 2, '😻': 2, '😼': 1, '😽': 1, '🙀': -2,
      '😿': -2, '😾': -2, '❤️': 2, '🧡': 2, '💛': 2, '💚': 2, '💙': 2,
      '💜': 2, '🖤': 0, '🤍': 2, '🤎': 0, '💔': -2, '❣️': 2, '💕': 2,
      '💞': 2, '💓': 2, '💗': 2, '💖': 2, '💘': 2, '💝': 2, '💟': 2,
      '♥️': 2, '💯': 2, '💢': -2, '💥': 0, '💫': 1, '💦': 0, '💨': 0,
      '🕳️': -1, '💣': -2, '💬': 0, '👁️‍🗨️': 0, '🗨️': 0, '🗯️': -1, '💭': 0,
      '💤': 0, '👋': 1, '🤚': 1, '🖐️': 1, '✋': 1, '🖖': 1, '👌': 2,
      '🤌': 0, '🤏': 0, '✌️': 1, '🤞': 1, '🤟': 1, '🤘': 1, '🤙': 1,
      '👈': 0, '👉': 0, '👆': 0, '🖕': -2, '👇': 0, '☝️': 0, '👍': 2,
      '👎': -2, '👊': -1, '✊': 0, '🤛': -1, '🤜': -1, '👏': 2, '🙌': 2,
      '👐': 1, '🤲': 1, '🤝': 2, '🙏': 1, '✍️': 0, '💅': 0, '🤳': 0,
      '💪': 1, '🦾': 1, '🦿': 0, '🦵': 0, '🦶': 0, '👂': 0, '🦻': 0,
      '👃': 0, '🧠': 1, '🫀': 1, '🫁': 0, '🦷': 0, '🦴': 0, '👀': 0,
      '👁️': 0, '👅': 0, '👄': 1, '💋': 2, '🩸': -1, '🔥': 1, '⭐': 2,
      '🌟': 2, '💫': 1, '⚡': 1, '☄️': 1, '💥': 0, '🔆': 1, '☀️': 2,
      '🌤️': 1, '⛅': 0, '🌦️': -1, '🌧️': -1, '⛈️': -2, '🌩️': -1, '🌨️': 0,
      '❄️': 0, '☃️': 1, '⛄': 1, '🌬️': 0, '💨': 0, '🌪️': -2, '🌫️': -1,
      '🌈': 2, '☂️': 0, '☔': -1, '⚡': 1, '❄️': 0, '🔥': 1, '💧': 0,
      '🌊': 0, '🎉': 2, '🎊': 2, '🎈': 2, '🎁': 2, '🎀': 1, '🎗️': 1,
      '🎟️': 1, '🎫': 1, '🎖️': 2, '🏆': 2, '🏅': 2, '🥇': 2, '🥈': 1,
      '🥉': 1, '⚽': 1, '⚾': 1, '🥎': 1, '🏀': 1, '🏐': 1, '🏈': 1,
      '🏉': 1, '🎾': 1, '🥏': 1, '🎳': 1, '🏏': 1, '🏑': 1, '🏒': 1,
      '🥍': 1, '🏓': 1, '🏸': 1, '🥊': 0, '🥋': 1, '🎯': 1, '⛳': 1,
      '🪀': 1, '🪁': 1, '🎣': 1, '🤿': 1, '🎽': 1, '🎿': 1, '🛷': 1,
      '🥌': 1, '🎲': 1, '🎰': 0, '🎮': 1, '🕹️': 1, '🎧': 1, '🎤': 1,
      '🎸': 1, '🥁': 1, '🎹': 1, '🎺': 1, '🎷': 1, '🎻': 1, '🪕': 1,
      '🥖': 1, '🍞': 1, '🥨': 1, '🥯': 1, '🥞': 1, '🧇': 1, '🧀': 1,
      '🍖': 1, '🍗': 1, '🥩': 1, '🥓': 1, '🍔': 1, '🍟': 1, '🍕': 2,
      '🌭': 1, '🥪': 1, '🌮': 1, '🌯': 1, '🥙': 1, '🧆': 1, '🥚': 1,
      '🍳': 1, '🥘': 1, '🍲': 1, '🥣': 1, '🥗': 1, '🍿': 1, '🧈': 1,
      '🧂': 0, '🥫': 0, '🍱': 1, '🍘': 1, '🍙': 1, '🍚': 1, '🍛': 1,
      '🍜': 1, '🍝': 1, '🍠': 1, '🍢': 1, '🍣': 1, '🍤': 1, '🍥': 1,
      '🥮': 1, '🍡': 1, '🥟': 1, '🥠': 1, '🥡': 1, '🍦': 2, '🍧': 2,
      '🍨': 2, '🍩': 2, '🍪': 2, '🎂': 2, '🍰': 2, '🧁': 2, '🥧': 2,
      '🍫': 2, '🍬': 2, '🍭': 2, '🍮': 1, '🍯': 1, '🍼': 1, '🥛': 1,
      '☕': 1, '🍵': 1, '🍶': 1, '🍾': 2, '🍷': 1, '🍸': 1, '🍹': 1,
      '🍺': 1, '🍻': 2, '🥂': 2, '🥃': 1, '🥤': 1, '🧋': 1, '🧃': 1,
      '🧉': 1, '🧊': 0
    };
  }

  /**
   * Analyze sentiment of comments
   * @param {Array} comments - Array of comment objects
   * @returns {Promise<Object>} Sentiment analysis results
   */
  async analyzeComments(comments) {
    if (!comments || comments.length === 0) {
      throw new Error('No comments provided for analysis');
    }

    console.log(`Analyzing sentiment for ${comments.length} comments...`);

    const results = {
      total: comments.length,
      positive: [],
      negative: [],
      neutral: [],
      summary: {
        positive: 0,
        negative: 0,
        neutral: 0,
        positivePercent: 0,
        negativePercent: 0,
        neutralPercent: 0
      }
    };

    // Process comments in batches to avoid blocking
    const batchSize = 10;
    for (let i = 0; i < comments.length; i += batchSize) {
      const batch = comments.slice(i, i + batchSize);
      
      for (const comment of batch) {
        const sentiment = this.analyzeSingleComment(comment);
        comment.sentiment = sentiment;
        
        // Categorize comment
        if (sentiment.score > 0.1) {
          results.positive.push(comment);
        } else if (sentiment.score < -0.1) {
          results.negative.push(comment);
        } else {
          results.neutral.push(comment);
        }
      }
      
      // Yield control to prevent blocking
      if (i + batchSize < comments.length) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    // Sort by confidence and likes
    results.positive.sort((a, b) => {
      const scoreA = a.sentiment.confidence * (Math.log(a.likes + 1) + 1);
      const scoreB = b.sentiment.confidence * (Math.log(b.likes + 1) + 1);
      return scoreB - scoreA;
    });

    results.negative.sort((a, b) => {
      const scoreA = a.sentiment.confidence * (Math.log(a.likes + 1) + 1);
      const scoreB = b.sentiment.confidence * (Math.log(b.likes + 1) + 1);
      return scoreB - scoreA;
    });

    // Calculate summary statistics
    results.summary.positive = results.positive.length;
    results.summary.negative = results.negative.length;
    results.summary.neutral = results.neutral.length;
    
    results.summary.positivePercent = Math.round((results.positive.length / comments.length) * 100);
    results.summary.negativePercent = Math.round((results.negative.length / comments.length) * 100);
    results.summary.neutralPercent = Math.round((results.neutral.length / comments.length) * 100);

    console.log('Sentiment analysis complete:', results.summary);
    return results;
  }

  /**
   * Analyze sentiment of a single comment
   * @param {Object} comment - Comment object with text property
   * @returns {Object} Sentiment result
   */
  analyzeSingleComment(comment) {
    const text = comment.text.toLowerCase();
    const words = this.tokenize(text);
    
    let score = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let totalWords = words.length;
    
    // Check for emojis first
    const emojiScore = this.analyzeEmojis(comment.text);
    score += emojiScore.score;
    
    // Analyze words
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let wordScore = 0;
      
      // Check if word is positive or negative
      if (this.positiveWords.has(word)) {
        wordScore = 1;
        positiveCount++;
      } else if (this.negativeWords.has(word)) {
        wordScore = -1;
        negativeCount++;
      }
      
      // Apply intensifiers
      if (wordScore !== 0) {
        const prevWord = i > 0 ? words[i - 1] : null;
        const nextWord = i < words.length - 1 ? words[i + 1] : null;
        
        if (prevWord && this.intensifiers.has(prevWord)) {
          wordScore *= 1.5;
        }
        if (nextWord && this.intensifiers.has(nextWord)) {
          wordScore *= 1.3;
        }
        
        // Apply negation
        const negationWindow = Math.min(i, 3);
        for (let j = 1; j <= negationWindow; j++) {
          if (i - j >= 0 && this.negators.has(words[i - j])) {
            wordScore *= -0.8;
            break;
          }
        }
      }
      
      score += wordScore;
    }
    
    // Normalize score
    if (totalWords > 0) {
      score = score / Math.sqrt(totalWords);
    }
    
    // Apply emoji weight
    score += emojiScore.score * 0.3;
    
    // Calculate confidence based on sentiment word density
    const sentimentWordCount = positiveCount + negativeCount + emojiScore.count;
    const confidence = Math.min(sentimentWordCount / Math.max(totalWords, 1), 1.0);
    
    // Determine category
    let category = 'neutral';
    if (score > 0.1) {
      category = 'positive';
    } else if (score < -0.1) {
      category = 'negative';
    }
    
    return {
      score: Math.max(-1, Math.min(1, score)), // Clamp between -1 and 1
      category: category,
      confidence: confidence,
      details: {
        positiveWords: positiveCount,
        negativeWords: negativeCount,
        emojis: emojiScore.count,
        totalWords: totalWords
      }
    };
  }

  /**
   * Analyze emoji sentiment in text
   * @param {string} text - Text to analyze
   * @returns {Object} Emoji analysis result
   */
  analyzeEmojis(text) {
    let score = 0;
    let count = 0;
    
    // Match emoji characters (basic Unicode ranges)
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = text.match(emojiRegex) || [];
    
    for (const emoji of emojis) {
      if (this.emojiSentiment[emoji] !== undefined) {
        score += this.emojiSentiment[emoji];
        count++;
      }
    }
    
    return { score, count };
  }

  /**
   * Tokenize text into words
   * @param {string} text - Text to tokenize
   * @returns {Array} Array of words
   */
  tokenize(text) {
    return text
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .split(/\s+/) // Split on whitespace
      .filter(word => word.length > 0) // Remove empty strings
      .map(word => word.toLowerCase()); // Convert to lowercase
  }

  /**
   * Get top comments by sentiment
   * @param {Array} comments - Comments with sentiment analysis
   * @param {string} type - 'positive' or 'negative'
   * @param {number} count - Number of top comments to return
   * @returns {Array} Top comments
   */
  getTopComments(comments, type, count = 3) {
    const filtered = comments.filter(comment => 
      comment.sentiment && comment.sentiment.category === type
    );
    
    return filtered
      .sort((a, b) => {
        // Sort by sentiment confidence and likes
        const scoreA = a.sentiment.confidence * Math.log(a.likes + 2);
        const scoreB = b.sentiment.confidence * Math.log(b.likes + 2);
        return scoreB - scoreA;
      })
      .slice(0, count);
  }
}

// Export for use in other modules
window.SentimentAnalyzer = SentimentAnalyzer;
