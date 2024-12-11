import { ref } from 'vue';
import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { useI18n } from 'vue-i18n';

export function useAudioTour() {
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
      id: 'audio-tour-intro',
      title: t('tours.audioPage.1.title'),
      text: t('tours.audioPage.1.text'),
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
      id: 'audio-controls-tour',
      title: t('tours.audioPage.2.title'),
      text: t('tours.audioPage.2.text'),
      attachTo: {
        element: '.status-controller',
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
      id: 'progress-tour',
      title: t('tours.audioPage.3.title'),
      text: t('tours.audioPage.3.text'),
      attachTo: {
        element: '.progress-bar',
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
      id: 'volume-control-tour',
      title: t('tours.audioPage.4.title'),
      text: t('tours.audioPage.4.text'),
      attachTo: {
        element: '.volume-icon',
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
      id: 'author-profile-tour',
      title: t('tours.audioPage.5.title'),
      text: t('tours.audioPage.5.text'),
      attachTo: {
        element: '.user-info',
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
      id: 'community-tour',
      title: t('tours.audioPage.6.title'),
      text: t('tours.audioPage.6.text'),
      attachTo: {
        element: '.community',
        on: 'top',
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
      id: 'rating-tour',
      title: t('tours.audioPage.7.title'),
      text: t('tours.audioPage.7.text'),
      attachTo: {
        element: '.star-rating',
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
      id: 'bookmark-tour',
      title: t('tours.audioPage.8.title'),
      text: t('tours.audioPage.8.text'),
      attachTo: {
        element: '.bookmark-btn',
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
      id: 'comments-tour',
      title: t('tours.audioPage.9.title'),
      text: t('tours.audioPage.9.text'),
      attachTo: {
        element: '.comment-section',
        on: 'top',
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
