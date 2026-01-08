// User-facing message constants for the application

export const MESSAGES = {
  // Success messages
  SUCCESS: {
    CHANNEL_UPDATED: 'Channel updated successfully!',
    VIDEO_ADDED: 'Video added successfully! Transcription will be processed shortly.',
    TRANSCRIPTION_DELETED: 'Transcription deleted successfully',
    ARTICLE_ADDED: 'Article added successfully!',
    ARTICLE_DELETED: 'Article deleted successfully',
  },

  // Error messages
  ERROR: {
    CHANNEL_UPDATE: 'Error updating channel:',
    VIDEO_ADD: 'Error adding video:',
    ARTICLE_ADD: 'Error adding article:',
    GENERIC: 'An error occurred',
    LOADING_CHANNELS: 'Error loading channels',
    LOADING_TRANSCRIPTIONS: 'Error loading transcriptions',
    LOADING_ARTICLES: 'Error loading articles',
    LOADING_TRANSCRIPTION: 'Error loading transcription',
    LOADING_ARTICLE: 'Error loading article',
  },

  // Validation messages
  VALIDATION: {
    INVALID_URL: 'Please enter a valid URL',
    SELECT_CHANNEL: 'Please select a channel',
    SELECT_FEED_PROFILE: 'Please select a feed profile',
  },

  // Confirmation messages
  CONFIRM: {
    DELETE_TRANSCRIPTION: 'Are you sure you want to delete this transcription?',
  },

  // Info messages
  INFO: {
    NO_CHANNELS: 'No channels found',
    NO_TRANSCRIPTIONS: 'No transcriptions found',
    NO_ARTICLES: 'No articles found',
  },
} as const;

