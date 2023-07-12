import './sass/index.scss';
import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

let currentPage = 1;
let total = 1;

let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 500,
});

const search = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const output = document.getElementById('js-output');
let isLoading = false;

//ustaw conf dla PixaBay
const configAxios = searchText => {
  return {
    params: {
      key: '21202878-7eed95eba93d8479640dfcfe2',
      q: searchText,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      per_page: 40,
      page: currentPage,
    },
  };
};

//pobierz obrazy
async function getPhotos(searchText) {
  try {
    //debugger;
    const response = await axios.get(
      'https://pixabay.com/api/',
      configAxios(searchText)
    );
    //debugger;
    //console.log(response);
    if (response.data.hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      //debugger;
      total = response.data.totalHits;
      if (currentPage === 1) {
        Notify.success(`Hooray! We found ${total} images.`);
      }

      response.data.hits.forEach(image => printImage(image));
      lightbox.refresh();
    }
  } catch (error) {
    console.error(error);
  }
}

//wyświetl obrazy
const printImage = image => {
  const smallImage = image.webformatURL;
  const largeImage = image.largeImageURL;
  const tags = image.tags;
  const likes = image.likes;
  const views = image.views;
  const comments = image.comments;
  const downloads = image.downloads;

  output.innerHTML += `
  <div class="photo-card">
  <a href="${largeImage}" target="_blank">
  <img class="image" src="${smallImage}" alt="${tags}" loading="lazy" />
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b> </br>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views</b></br>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments</b></br>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b></br>
      ${downloads}
    </p>
  </div>
</div>
  `;
};

const loadMore = async () => {
  if (total / 40 > currentPage) {
    if (isLoading === true) {
      debugger;
      return;
    }

    isLoading = true;

    currentPage += 1;
    const textToSearch = localStorage.getItem('searchText');
    await getPhotos(textToSearch);

    isLoading = false;
    scrollNow();
  } else {
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  }
};

searchButton.addEventListener('click', async event => {
  event.preventDefault();
  currentPage = 1;
  const inputValue = search.value;
  output.innerHTML = '';
  //console.log('próbujemy...');
  await getPhotos(inputValue);
  localStorage.setItem('searchText', inputValue);
  search.value = '';
});

//przewijanie strony
const scrollNow = () => {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  console.log(cardHeight);
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
};

// Sprawdź, czy strona jest na końcu dokumentu
const isPageBottom = () => {
  return (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100
  );
};

window.addEventListener('scroll', () => {
  if (isPageBottom()) {
    loadMore();
  }
});
