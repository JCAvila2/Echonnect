import { defineComponent, onMounted, onBeforeUnmount } from 'vue';
import Shepherd, { Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export default defineComponent({
  setup() {
    let tour: Tour;

    const initTour = () => {
      // Create a new tour
      tour = new Shepherd.Tour({
        defaultStepOptions: {
          cancelIcon: {
            enabled: true
          },
          classes: 'custom-shepherd-class123',
          scrollTo: { behavior: 'smooth', block: 'center' }
        },
        useModalOverlay: true
      });


      // Define tour steps
      tour.addStep({
        id: 'search-tour-intro',
        title: 'Welcome to Search page!',
        text: 'Let\'s explore the audio search functionality together!',
        attachTo: {
          element: '.tour-button',
          on: 'top'
        },
        buttons: [
          {
            text: 'Next',
            action: tour.next
          }
        ]
      });

      tour.addStep({
        id: 'search-bar-tour',
        title: 'Search Bar',
        text: 'Use this search bar to find audios by title or tags. You can search for specific content or keywords.',
        attachTo: {
          element: '.search-bar-container',
          on: 'bottom'
        },
        buttons: [
          {
            text: 'Back',
            action: tour.back
          },
          {
            text: 'Next',
            action: tour.next
          }
        ]
      });

      tour.addStep({
        id: 'results-tour',
        title: 'Search Results',
        text: 'Here you can see the list of audio results. Click on an item to listen or view the author\'s profile.',
        attachTo: {
          element: '.custom-table, .mobile-list',
          on: 'bottom'
        },
        buttons: [
          {
            text: 'Back',
            action: tour.back
          },
          {
            text: 'Next',
            action: tour.next
          }
        ]
      });

      tour.addStep({
        id: 'table-details-tour',
        title: 'Audio Details',
        text: 'Each audio entry shows key information: thumbnail, title, author, duration, creation date, rating, and play count.',
        attachTo: {
          element: '.custom-table, .mobile-list',
          on: 'bottom'
        },
        buttons: [
          {
            text: 'Back',
            action: tour.back
          },
          {
            text: 'Finish',
            action: tour.complete
          }
        ]
      });
    };

    const startTour = () => {
      if (!tour) {
        initTour();
      }
      tour.start();
    };

    const destroyTour = () => {
      if (tour) {
        tour.complete();
        //tour = undefined;
      }
    };

    onMounted(() => {
      // Optional: You can automatically start the tour or add a method to trigger it
      // startTour();
    });

    onBeforeUnmount(() => {
      destroyTour();
    });

    return {
      startTour,
      destroyTour
    };
  }
});

// To use in the main component, modify the script section like this:
// import ShepherdTour from './path-to-shepherd-tour';
// 
// export default {
//   mixins: [ShepherdTour],
//   methods: {
//     openTour() {
//       this.startTour();
//     }
//   }
// }
