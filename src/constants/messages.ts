export const MESSAGES = {
  SUCCESS: {
    CHANNEL_UPDATED: 'Channel updated successfully!',
    CHANNEL_CREATED: 'Channel created successfully!',
    VIDEO_ADDED: 'Video added successfully! Transcription will be processed shortly.',
    TRANSCRIPTION_DELETED: 'Transcription deleted successfully',
    ARTICLE_ADDED: 'Article added successfully!',
    ARTICLE_DELETED: 'Article deleted successfully',
  },

  ERROR: {
    CHANNEL_UPDATE: 'Error updating channel:',
    CHANNEL_CREATE: 'Error creating channel:',
    VIDEO_ADD: 'Error adding video:',
    ARTICLE_ADD: 'Error adding article:',
    ARTICLE_DELETE: 'Error deleting article:',
    TRANSCRIPTION_DELETE: 'Error deleting transcription:',
    GENERIC: 'An error occurred',
    LOADING_CHANNELS: 'Error loading channels',
    LOADING_TRANSCRIPTIONS: 'Error loading transcriptions',
    LOADING_ARTICLES: 'Error loading articles',
    LOADING_TRANSCRIPTION: 'Error loading transcription',
    LOADING_ARTICLE: 'Error loading article',
  },

  VALIDATION: {
    INVALID_URL: 'Please enter a valid URL',
    SELECT_CHANNEL: 'Please select a channel',
    SELECT_FEED_PROFILE: 'Please select a feed profile',
  },

  CONFIRM: {
    DELETE_TRANSCRIPTION: 'Are you sure you want to delete this transcription?',
  },

  INFO: {
    NO_CHANNELS: 'No channels found',
    NO_TRANSCRIPTIONS: 'No transcriptions found',
    NO_ARTICLES: 'No articles found',
  },
} as const;
