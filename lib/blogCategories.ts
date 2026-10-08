// Humanity is for stories; selected technical categories stay out of topics.
export const STORY_CATEGORY = 'Humanity';
export const EXCLUDED_TOPIC_CATEGORIES = ['Logic & Dev', 'MuayLang'];
export const blogCategoryFilter = {
  tags: { $exists: true, $ne: [] },
};
