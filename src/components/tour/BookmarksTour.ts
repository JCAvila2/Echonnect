import { ref } from 'vue';
import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { useI18n } from 'vue-i18n';

export function useBookmarksTour() {
  const { t } = useI18n();
  const tour = ref<Tour | null>(null);

  const initTour = () => {
    tour.value = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        classes: 'custom-shepherd-class',
        scrollTo: { behavior: 'smooth', block: 'center' },
      },
      useModalOverlay: true,
    });

    // Steps
    tour.value.addStep({
      id: 'bookmarks-tour-intro',
      title: t('tours.bookmarksPage.1.title'),
      text: t('tours.bookmarksPage.1.text'),
      attachTo: {
        element: '.tour-button',
        on: 'top',
      },
      buttons: [
        {
          text: t('next'),
          action: () => tour.value?.next(),
        },
      ],
    });

    tour.value.addStep({
      id: 'bookmarks-bar-tour',
      title: t('tours.bookmarksPage.2.title'),
      text: t('tours.bookmarksPage.2.text'),
      attachTo: {
        element: '.search-bar-container',
        on: 'bottom',
      },
      buttons: [
        {
          text: t('back'),
          action: () => tour.value?.back(),
        },
        {
          text: t('next'),
          action: () => tour.value?.next(),
        },
      ],
    });

    tour.value.addStep({
      id: 'results-tour',
      title: t('tours.bookmarksPage.3.title'),
      text: t('tours.bookmarksPage.3.text'),
      attachTo: {
        element: '.custom-table, .mobile-list',
        on: 'bottom',
      },
      buttons: [
        {
          text: t('back'),
          action: () => tour.value?.back(),
        },
        {
          text: t('next'),
          action: () => tour.value?.next(),
        },
      ],
    });

    tour.value.addStep({
      id: 'table-details-tour',
      title: t('tours.bookmarksPage.4.title'),
      text: t('tours.bookmarksPage.4.text'),
      attachTo: {
        element: '.item, .mobile-list',
        on: 'bottom',
      },
      buttons: [
        {
          text: t('back'),
          action: () => tour.value?.back(),
        },
        {
          text: t('next'),
          action: () => tour.value?.next(),
        },
      ],
    });

    tour.value.addStep({
      id: 'delete-bookmark-tour',
      title: t('tours.bookmarksPage.5.title'),
      text: t('tours.bookmarksPage.5.text'),
      attachTo: {
        element: '.icon',
        on: 'bottom',
      },
      buttons: [
        {
          text: t('back'),
          action: () => tour.value?.back(),
        },
        {
          text: t('finish'),
          action: () => tour.value?.complete(),
        },
      ],
    });

  };

  const startTour = () => {
    if (!tour.value) {
      initTour();
    }
    tour.value?.start();
  };

  const destroyTour = () => {
    if (tour.value) {
      tour.value.complete();
      tour.value = null;
    }
  };

  return {
    startTour,
    destroyTour,
  };
}
