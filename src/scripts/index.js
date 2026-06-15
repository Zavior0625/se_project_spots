import "../pages/index.css";
import "../pages/index.css";
import {
  enableValidation,
  validationConfig,
  hideInputError,
  resetValidation,
} from "./validation.js";

import Api from "./utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "146bfdd1-08d7-4000-bcf6-cc386bcfd6ee",
    "Content-Type": "application/json",
  },
});

const profileEditBtn = document.querySelector(".profile__edit-btn");
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__avatar");

const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileForm = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector("#name-input");
const editProfileDescriptionInput =
  editProfileModal.querySelector("#description-input");

const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostForm = newPostModal.querySelector(".modal__form");
const cardCaptionInput = newPostModal.querySelector("#card-caption-input");
const cardImageInput = newPostModal.querySelector("#card-image-input");

const cardsList = document.querySelector(".cards__list");

const imageModal = document.querySelector("#image-preview-modal");
const modalImage = imageModal.querySelector(".modal__image");
const modalCaption = imageModal.querySelector(".modal__caption");

const cardTemplate = document.querySelector("#card-template").content;

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscClose);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscClose);
}

function handleEscClose(evt) {
  if (evt.key === "Escape") {
    const opened = document.querySelector(".modal_is-opened");
    if (opened) closeModal(opened);
  }
}

function setUserInfo(user) {
  profileNameEl.textContent = user.name;
  profileDescriptionEl.textContent = user.about;
  profileAvatar.src = user.avatar;
}

function getCardElement(data) {
  const card = cardTemplate.querySelector(".card").cloneNode(true);

  const image = card.querySelector(".card__image");
  const title = card.querySelector(".card__title");
  const likeBtn = card.querySelector(".card__like-btn");
  const deleteBtn = card.querySelector(".card__delete-btn");

  image.src = data.link;
  image.alt = data.name;
  title.textContent = data.name;

  image.addEventListener("click", () => {
    modalImage.src = data.link;
    modalImage.alt = data.name;
    modalCaption.textContent = data.name;
    openModal(imageModal);
  });

  likeBtn.addEventListener("click", () => {
    const isLiked = likeBtn.classList.contains("card__like-btn_active");

    const request = isLiked ? api.unlikeCard(data._id) : api.likeCard(data._id);

    request
      .then(() => {
        likeBtn.classList.toggle("card__like-btn_active");
      })
      .catch(console.error);
  });

  deleteBtn.addEventListener("click", () => {
    card.remove();
  });

  return card;
}

function renderCards(cards) {
  cards.forEach((card) => {
    cardsList.append(getCardElement(card));
  });
}

api
  .getAppData()
  .then(([user, cards]) => {
    setUserInfo(user);
    renderCards(cards);
  })
  .catch(console.error);

function handleEditProfileSubmit(evt) {
  evt.preventDefault();

  const submitButton = evt.submitter;
  submitButton.textContent = "Saving...";

  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((user) => {
      setUserInfo(user);
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      submitButton.textContent = "Save";
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  const submitButton = evt.submitter;
  submitButton.textContent = "Saving...";

  api
    .addCard({
      name: cardCaptionInput.value,
      link: cardImageInput.value,
    })
    .then((card) => {
      cardsList.prepend(getCardElement(card));

      evt.target.reset();
      resetValidation(newPostForm, validationConfig);
      closeModal(newPostModal);
    })
    .catch(console.error)
    .finally(() => {
      submitButton.textContent = "Save";
    });
}

editProfileForm.addEventListener("submit", handleEditProfileSubmit);
newPostForm.addEventListener("submit", handleAddCardSubmit);

profileEditBtn.addEventListener("click", () => {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;

  openModal(editProfileModal);
});

newPostBtn.addEventListener("click", () => {
  openModal(newPostModal);
});

document.addEventListener("click", (evt) => {
  const modal = evt.target.closest(".modal");
  if (!modal) return;

  if (evt.target === modal || evt.target.closest(".modal__close-btn")) {
    closeModal(modal);
  }
});

enableValidation(validationConfig);
