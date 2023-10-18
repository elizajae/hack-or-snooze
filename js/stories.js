"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage(storyList);
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  let isFavorite = false;
  let isOwnStory = false;

  if (currentUser) {
    const found = currentUser.favorites.find(
      (article) => article.storyId === story.storyId
    );

    isFavorite = found ? true : false;

    const foundOwnStory = currentUser.ownStories.find(
      (article) => article.storyId === story.storyId
    );

    isOwnStory = foundOwnStory ? true : false;
  }

  if (isFavorite) {
    console.log(currentUser.favorites, story);
  }

  const favoriteStar = `<i class="${isFavorite ? "fas" : "far"} fa-star"></i>`;

  const trashIcon = '<i class="fas fa-trash"></i>';

  return $(`
      <li id="${story.storyId}">
       <div class="story">
        <div class="story-left">
        ${currentUser ? favoriteStar : ""}
        ${currentUser && isOwnStory ? trashIcon : ""}
        </div>
        <div class="story-right">
          <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title} <small class="story-hostname">(${hostName})</small>
          </a>
          
          <small class="story-author">by ${story.author}</small>
          <small class="story-user">posted by ${story.username}</small>
        </div>
       </div>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage(storyList) {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $("i").click(async (evt) => {
    const storyId = evt.target.parentElement.id;

    const isTrash = Array.from(evt.target.classList).includes("fa-trash");

    if (isTrash) {
      await currentUser.deleteArticle(storyId);

      storyList.stories = storyList.stories.filter(
        (story) => story.storyId !== storyId
      );

      putStoriesOnPage(storyList);
      return;
    }

    const favorited = Array.from(evt.target.classList).includes("fas");

    if (favorited) {
      await currentUser.unFavoriteArticle(storyId);
    } else {
      await currentUser.favoriteArticle(storyId);
    }

    putStoriesOnPage(storyList);
  });

  $allStoriesList.show();
}

async function onPostSubmit(evt) {
  evt.preventDefault();
  const author = $authorInput.val();
  const title = $titleInput.val();
  const url = $urlInput.val();

  await storyList.addStory(currentUser, {
    author,
    title,
    url,
  });

  $submitForm.trigger("reset");
}

$submitForm.on("submit", onPostSubmit);
