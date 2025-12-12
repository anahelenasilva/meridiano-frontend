---
name: Add Article Modal Feature
overview: Add functionality to manually add articles via a modal dialog. The modal will appear when clicking an "Add Article" button in the articles page header, allowing users to submit an article URL via POST /articles endpoint.
todos:
  - id: add-api-method
    content: Add addArticle method to apiService in src/services/api.ts
    status: pending
  - id: add-modal-state
    content: Add state management for modal visibility, URL input, and submission status in articles page
    status: pending
  - id: add-header-button
    content: Add 'Add Article' button in header section opposite to 'Articles' title
    status: pending
  - id: create-modal-ui
    content: Create modal component with URL input field, Close button, and Add Article button
    status: pending
  - id: implement-mutation
    content: Implement useMutation hook to handle POST /articles API call with success/error handling
    status: pending
---

# Add Article Modal Feature

## Overview

Add a button "Add Article" in the articles page header (opposite to the "Articles" title) that opens a modal dialog. The modal will contain an input field for the article URL and buttons to close or submit the article.

## Implementation Details

### 1. Update API Service (`src/services/api.ts`)

Add a new `addArticle` method to the `apiService` object:

```typescript
addArticle: (url: string) =>
  api.post('/articles', { url }),
```

### 2. Update Articles Page (`app/articles/page.tsx`)

- **Add state management:**
  - `isModalOpen` state to control modal visibility
  - `articleUrl` state to store the input URL value
  - `isSubmitting` state to handle loading state during submission

- **Add "Add Article" button:**
  - Place in the header section (line 125-146), opposite to the "Articles" title
  - Use flexbox layout with `justify-between` to position it on the right side
  - Style consistently with existing buttons (blue background, white text)

- **Create modal component:**
  - Fixed overlay with backdrop (semi-transparent dark background)
  - Centered modal container with white background
  - Modal content:
    - Label "Article URL"
    - Text input field for URL
    - Two buttons: "Close" (secondary style) and "Add Article" (primary style)
  - Close modal when clicking backdrop or "Close" button

- **Add mutation handler:**
  - Use `useMutation` from `@tanstack/react-query`
  - Call `apiService.addArticle(articleUrl)` on submit
  - On success: invalidate articles query to refresh the list, close modal, clear input, show success message
  - On error: display error message
  - Handle loading state during submission (disable buttons, show loading indicator)

### 3. Styling

- Use Tailwind CSS classes consistent with existing design patterns
- Modal should be responsive and centered
- Input field should match existing form input styles (see line 155-166 for reference)
- Buttons should match existing button styles (see line 325-346 for reference)

## Files to Modify

- `src/services/api.ts` - Add `addArticle` method
- `app/articles/page.tsx` - Add button, modal, state management, and mutation logic