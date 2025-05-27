/**
 * Enhanced AI-powered sentiment analysis with improved accuracy and transparency
 * Provides detailed analysis reasoning for each comment
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
      'warm', 'welcome', 'wise', 'wow', 'yes', 'yay', 'yeah', 'like', 'liked', 'likes'
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
      'victim', 'virus', 'warning', 'weak', 'weird', 'wild', 'wound', 'dislike', 'disliked'
    ]);

    // Enhanced phrase patterns for better context understanding
    this.positivePatterns = [
      /\b(so good|really good|very good|pretty good|quite good)\b/gi,
      /\b(love it|love this|absolutely love|really love)\b/gi,
      /\b(well done|great job|nice work|good work)\b/gi,
      /\b(thank you|thanks|appreciate|grateful)\b/gi,
      /\b(highly recommend|would recommend|definitely recommend)\b/gi,
      /\b(keep it up|keep going|more like this)\b/gi,
      /\b(made my day|brightened my day|put a smile)\b/gi
    ];

    this.negativePatterns = [
      /\b(so bad|really bad|very bad|pretty bad|quite bad)\b/gi,
      /\b(hate it|hate this|absolutely hate|really hate)\b/gi,
      /\b(waste of time|wasting time|total waste)\b/gi,
      /\b(not good|not great|not worth|not recommended)\b/gi,
      /\b(disappointed|let down|expected better)\b/gi,
      /\b(makes me sick|makes me angry|drives me crazy)\b/gi,
      /\b(worst ever|terrible quality|horrible experience)\b/gi
    ];

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
   * Enhanced AI analysis of comments with detailed reasoning
   * @param {Array} comments - Array of comment objects
   * @returns {Promise<Object>} Comprehensive sentiment analysis results
   */
  async analyzeComments(comments) {
    if (!comments || comments.length === 0) {
      throw new Error('No comments provided for analysis');
    }

    console.log(`🤖 AI analyzing sentiment for ${comments.length} comments...`);

    const results = {
      total: comments.length,
      positive: [],
      negative: [],
      neutral: [],
      other: [], // For comments that couldn't be properly analyzed
      summary: {
        positive: 0,
        negative: 0,
        neutral: 0,
        other: 0,
        positivePercent: 0,
        negativePercent: 0,
        neutralPercent: 0,
        otherPercent: 0
      },
      analysisDetails: {
        totalWordsAnalyzed: 0,
        sentimentWordsFound: 0,
        emojisAnalyzed: 0,
        phrasesDetected: 0,
        processingTime: 0
      }
    };

    const startTime = performance.now();

    // Process comments in batches to avoid blocking
    const batchSize = 5; // Smaller batches for more responsive UI
    for (let i = 0; i < comments.length; i += batchSize) {
      const batch = comments.slice(i, i + batchSize);
      
      for (const comment of batch) {
        const sentiment = this.analyzeSingleComment(comment);
        comment.sentiment = sentiment;
        
        // Update analysis details
        results.analysisDetails.totalWordsAnalyzed += sentiment.details.totalWords;
        results.analysisDetails.sentimentWordsFound += sentiment.details.positiveWords + sentiment.details.negativeWords;
        results.analysisDetails.emojisAnalyzed += sentiment.details.emojis;
        results.analysisDetails.phrasesDetected += sentiment.details.phrases || 0;
        
        // Enhanced categorization with better thresholds
        if (sentiment.score > 0.05 && sentiment.confidence > 0.1) {
          results.positive.push(comment);
        } else if (sentiment.score < -0.05 && sentiment.confidence > 0.1) {
          results.negative.push(comment);
        } else if (sentiment.confidence > 0.05) {
          results.neutral.push(comment);
        } else {
          // Comments with very low confidence go to "other"
          results.other.push(comment);
        }
      }
      
      // Yield control to prevent blocking
      if (i + batchSize < comments.length) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    // Enhanced sorting by AI confidence and engagement
    const sortByAIScore = (a, b) => {
      const scoreA = (a.sentiment.confidence * 2) + (Math.log(a.likes + 1) * 0.3) + (Math.abs(a.sentiment.score) * 0.5);
      const scoreB = (b.sentiment.confidence * 2) + (Math.log(b.likes + 1) * 0.3) + (Math.abs(b.sentiment.score) * 0.5);
      return scoreB - scoreA;
    };

    results.positive.sort(sortByAIScore);
    results.negative.sort(sortByAIScore);
    results.neutral.sort(sortByAIScore);
    results.other.sort(sortByAIScore);

    // Calculate summary statistics
    results.summary.positive = results.positive.length;
    results.summary.negative = results.negative.length;
    results.summary.neutral = results.neutral.length;
    results.summary.other = results.other.length;
    
    results.summary.positivePercent = Math.round((results.positive.length / comments.length) * 100);
    results.summary.negativePercent = Math.round((results.negative.length / comments.length) * 100);
    results.summary.neutralPercent = Math.round((results.neutral.length / comments.length) * 100);
    results.summary.otherPercent = Math.round((results.other.length / comments.length) * 100);

    results.analysisDetails.processingTime = Math.round(performance.now() - startTime);

    console.log('🎯 AI Sentiment analysis complete:', {
      ...results.summary,
      details: results.analysisDetails
    });
    
    return results;
  }

  /**
   * Enhanced AI analysis of a single comment with detailed reasoning
   * @param {Object} comment - Comment object with text property
   * @returns {Object} Detailed sentiment result with reasoning
   */
  analyzeSingleComment(comment) {
    const originalText = comment.text;
    const text = originalText.toLowerCase();
    const words = this.tokenize(text);
    
    let score = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let totalWords = words.length;
    let reasoning = [];
    
    // Short comments get special handling
    if (totalWords < 3) {
      const shortResult = this.analyzeShortComment(originalText);
      if (shortResult.found) {
        return shortResult.result;
      }
    }
    
    // 1. Check for phrase patterns first (more accurate than individual words)
    let phraseScore = 0;
    let phrasesFound = 0;
    
    for (const pattern of this.positivePatterns) {
      const matches = originalText.match(pattern);
      if (matches) {
        phraseScore += matches.length * 2; // Phrases are weighted higher
        phrasesFound += matches.length;
        reasoning.push(`Positive phrase: "${matches[0]}"`);
      }
    }
    
    for (const pattern of this.negativePatterns) {
      const matches = originalText.match(pattern);
      if (matches) {
        phraseScore -= matches.length * 2;
        phrasesFound += matches.length;
        reasoning.push(`Negative phrase: "${matches[0]}"`);
      }
    }
    
    score += phraseScore;
    
    // 2. Analyze emojis (important for YouTube comments)
    const emojiResult = this.analyzeEmojis(originalText);
    score += emojiResult.score * 1.2; // Emojis are very important on YouTube
    if (emojiResult.count > 0) {
      reasoning.push(`${emojiResult.count} sentiment emoji(s) found`);
    }
    
    // 3. Analyze individual words with context
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let wordScore = 0;
      
      // Check if word is positive or negative
      if (this.positiveWords.has(word)) {
        wordScore = 1;
        positiveCount++;
        reasoning.push(`Positive word: "${word}"`);
      } else if (this.negativeWords.has(word)) {
        wordScore = -1;
        negativeCount++;
        reasoning.push(`Negative word: "${word}"`);
      }
      
      // Apply intensifiers and negation with better logic
      if (wordScore !== 0) {
        const prevWord = i > 0 ? words[i - 1] : null;
        const nextWord = i < words.length - 1 ? words[i + 1] : null;
        
        // Check for intensifiers
        if (prevWord && this.intensifiers.has(prevWord)) {
          wordScore *= 1.8;
          reasoning.push(`Intensified by "${prevWord}"`);
        }
        if (nextWord && this.intensifiers.has(nextWord)) {
          wordScore *= 1.5;
        }
        
        // Check for negation (more sophisticated)
        let negated = false;
        const negationWindow = Math.min(i, 4);
        for (let j = 1; j <= negationWindow; j++) {
          if (i - j >= 0 && this.negators.has(words[i - j])) {
            wordScore *= -0.9;
            negated = true;
            reasoning.push(`Negated by "${words[i - j]}"`);
            break;
          }
        }
      }
      
      score += wordScore;
    }
    
    // 4. Apply advanced normalization
    if (totalWords > 0) {
      // Don't over-penalize longer comments
      const lengthPenalty = Math.min(Math.sqrt(totalWords) / 10, 0.5);
      score = score / (1 + lengthPenalty);
    }
    
    // 5. Calculate confidence based on multiple factors
    const sentimentIndicators = positiveCount + negativeCount + emojiResult.count + phrasesFound;
    let confidence = 0;
    
    if (totalWords === 0) {
      confidence = 0;
    } else if (totalWords < 3) {
      // Short comments need high sentiment indicator density
      confidence = Math.min(sentimentIndicators / 1, 1.0);
    } else {
      // Longer comments can have lower density but still be confident
      confidence = Math.min((sentimentIndicators / totalWords) * 3, 1.0);
    }
    
    // Boost confidence for clear sentiment
    if (Math.abs(score) > 1) {
      confidence = Math.min(confidence * 1.3, 1.0);
    }
    
    // 6. Determine category with better thresholds
    let category = 'neutral';
    if (score > 0.05 && confidence > 0.1) {
      category = 'positive';
    } else if (score < -0.05 && confidence > 0.1) {
      category = 'negative';
    } else if (confidence < 0.05) {
      category = 'other'; // Low confidence comments
    }
    
    return {
      score: Math.max(-3, Math.min(3, score)), // Wider range for better distinction
      category: category,
      confidence: confidence,
      reasoning: reasoning.slice(0, 3), // Keep top 3 reasons for UI
      details: {
        positiveWords: positiveCount,
        negativeWords: negativeCount,
        emojis: emojiResult.count,
        totalWords: totalWords,
        phrases: phrasesFound,
        originalText: originalText.substring(0, 100) // For debugging
      }
    };
  }

  /**
   * Handle very short comments (1-2 words) with special logic
   */
  analyzeShortComment(text) {
    const lowerText = text.toLowerCase().trim();
    
    // Common short positive comments
    const shortPositive = ['good', 'great', 'nice', 'cool', 'wow', 'amazing', 'awesome', 'perfect', 'love', 'yes', 'yay', '👍', '❤️', '😍', '🔥'];
    const shortNegative = ['bad', 'terrible', 'awful', 'hate', 'no', 'wrong', 'fail', 'stupid', '👎', '😡', '💩'];
    
    if (shortPositive.some(word => lowerText.includes(word))) {
      return {
        found: true,
        result: {
          score: 1.5,
          category: 'positive',
          confidence: 0.8,
          reasoning: [`Short positive comment: "${text}"`],
          details: { positiveWords: 1, negativeWords: 0, emojis: 0, totalWords: 1, phrases: 0 }
        }
      };
    }
    
    if (shortNegative.some(word => lowerText.includes(word))) {
      return {
        found: true,
        result: {
          score: -1.5,
          category: 'negative',
          confidence: 0.8,
          reasoning: [`Short negative comment: "${text}"`],
          details: { positiveWords: 0, negativeWords: 1, emojis: 0, totalWords: 1, phrases: 0 }
        }
      };
    }
    
    return { found: false };
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
