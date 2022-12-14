
window.addEventListener('DOMContentLoaded', () => {

   //-------------- Tabs -------------- 

   const tabs = document.querySelectorAll('.tabheader__item'),
      tabCont = document.querySelectorAll('.tabcontent'),
      tabParrent = document.querySelector('.tabheader__items');

   function HideTabContent() {
      tabCont.forEach(item => {
         item.classList.add('hide');
         item.classList.remove('show', 'fade');

      });

      tabs.forEach(item => {
         item.classList.remove('tabheader__item_active');

      });
   }

   function showTabContent(i = 0) {
      tabCont[i].classList.add('show', 'fade');
      tabCont[i].classList.remove('hide');
      tabs[i].classList.add('tabheader__item_active');
   }

   HideTabContent();
   showTabContent();

   tabParrent.addEventListener('click', (event) => {

      const target = event.target;

      if (target && target.classList.contains('tabheader__item')) {
         tabs.forEach((item, i) => {
            if (target == item) {
               HideTabContent();
               showTabContent(i);
            }
         });
      }
   });

   // -------------- TIMER -------------- 

   const deadline = '2022-10-20';

   function getTimeRemaining(endtime) {
      const t = Date.parse(endtime) - Date.parse(new Date()),
         days = Math.floor(t / (1000 * 60 * 60 * 24)), //floor - округл.//
         hours = Math.floor((t / (1000 * 60 * 60) % 24)),
         minutes = Math.floor((t / 1000 / 60) % 60),
         seconds = Math.floor((t / 1000) % 60);

      return {
         'total': t,
         'days': days,
         'hours': hours,
         'minutes': minutes,
         'seconds': seconds,
      };
   }

   function setClock(selector, endtime) {
      const timer = document.querySelector(selector),
         days = timer.querySelector('#days'),
         hours = timer.querySelector('#hours'),
         minutes = timer.querySelector('#minutes'),
         seconds = timer.querySelector('#seconds');
      timeInterval = setInterval(updateClock, 1000);

      updateClock();

      function getZero(num) {
         if (num >= 0 && num < 10) {
            return `0${num}`;
         } else {
            return num;
         }
      }

      function updateClock() {
         const t = getTimeRemaining(endtime);
         days.innerHTML = getZero(t.days);
         hours.innerHTML = getZero(t.hours);
         minutes.innerHTML = getZero(t.minutes);
         seconds.innerHTML = getZero(t.seconds);
         if (t.total <= 0) {
            clearInterval(timeInterval);
         }
      }
   }

   setClock('.timer', deadline);

   // -------------- MODAL WINDOW -------------- ! 

   const modalTrigger = document.querySelectorAll('[data-modal]'),
      modal = document.querySelector('.modal')

   function openModal() {
      modal.classList.add('show');
      modal.classList.remove('hide');
      document.body.style.overflow = 'hidden';
      clearInterval(modalTimerId);
   };

   modalTrigger.forEach(btn => {
      btn.addEventListener('click', openModal);
   });

   function closeModal() {
      modal.classList.add('hide');
      modal.classList.remove('show');
      document.body.style.overflow = '';
   };

   modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.getAttribute('data-close') == '') {
         closeModal();
      }
   })

   document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && modal.classList.contains('show')) {
         closeModal();
      }
   });

   const modalTimerId = setTimeout(openModal, 50000)

   function showModalByScroll() {
      if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
         openModal();
         window.removeEventListener('scroll', showModalByScroll);
      }
   }

   window.addEventListener('scroll', showModalByScroll);

   // -------------- Classes menu -------------- 

   class MenuCard {
      constructor(src, alt, title, descr, price, parentSelector, ...classes) {
         this.src = src;
         this.alt = alt;
         this.title = title;
         this.descr = descr;
         this.price = price;
         this.classes = classes;
         this.parent = document.querySelector(parentSelector);
         this.transfer = 27;
         this.changeToRub();
      }

      changeToRub() {
         this.price = this.price * this.transfer
      }

      render() {
         const element = document.createElement('div');
         if (this.classes.length === 0) {
            this.element = 'menu__item';
            element.classList.add(this.element)
         }
         else {
            this.classes.forEach(e => element.classList.add(e));
         }
         element.innerHTML = `
         <div class="menu__item">
         <img src=${this.src} alt=${this.alt}>
         <h3 class="menu__item-subtitle">${this.title}</h3>
         <div class="menu__item-descr">${this.descr}</div>
         <div class="menu__item-divider"></div>
         <div class="menu__item-price">
             <div class="menu__item-cost">Цена:</div>
             <div class="menu__item-total"><span>${this.price}</span> РУБ/день</div>
         </div>
     </div>`;
         this.parent.append(element);
      }
   }

   const getResource = async (url) => {
      const res = await fetch(url);

      if (!res.ok) {
         throw new Error(`Could not fetch ${url}, status: ${res.status}`);
      }

      return await res.json();
   };

   axios.get('http://localhost:3000/menu')
      .then(data => {
         data.data.forEach(({ img, altimg, title, descr, price }) => {
            new MenuCard(img, altimg, title, descr, price, '.menu .container').render();
         });
      });

   // -------------- FORMS -------------- 

   const forms = document.querySelectorAll('form');

   const message = {
      loading: 'img/form/spinner.svg',
      success: 'Спасибо, Скоро мы с вами свяжемся!',
      failure: 'Что-то пошло не так'
   };

   forms.forEach(item => {
      bindPostData(item);
   });

   const postData = async (url, data) => {
      const res = await fetch(url, {
         method: "POST",
         headers: {
            'Content-type': 'application/json'
         },
         body: data
      });
      return await res.json();
   };


   function bindPostData(form) {
      form.addEventListener('submit', (e) => {
         e.preventDefault();

         const statusMessage = document.createElement('img');
         statusMessage.src = message.loading;
         statusMessage.style.cssText = `
                  display: block;
                  margin: 0 auto;
               `;
         form.insertAdjacentElement('afterend', statusMessage);


         const request = new XMLHttpRequest();
         request.open('POST', 'js/server.php');

         const formData = new FormData(form);

         const json = JSON.stringify(Object.fromEntries(formData.entries()));


         postData('http://localhost:3000/requests', json)
            .then(data => {
               console.log(data);
               showThankModal(message.success);
               statusMessage.remove();
            }).catch(() => {
               showThankModal(message.failure);
            }).finally(() => {
               form.reset();
            });

         request.send(formData);
      })
   }

   // -------------- Show\Hide thanks modal --------------

   function showThankModal(message) {
      const prevModalDialog = document.querySelector('.modal__dialog');

      prevModalDialog.classList.add('hide');
      openModal();

      const thanksModal = document.createElement('div');
      thanksModal.classList.add('modal__dialog');
      thanksModal.innerHTML = `
            <div class="modal__content">
            <div class="modal__close" data-close>×</div>
            <div class="modal__title">${message}</div>
            </div>
            `;

      document.querySelector('.modal').append(thanksModal);
      setTimeout(() => {
         thanksModal.remove();
         prevModalDialog.classList.add('show');
         prevModalDialog.classList.remove('hide');
         closeModal()
      }, 3000);
   }

   fetch('http://localhost:3000/menu')
      .then(data => data.json())


   // -------------- Slider --------------

   const slides = document.querySelectorAll('.offer__slide'),
      prevSlide = document.querySelector('.offer__slider-prev'),
      nextSlide = document.querySelector('.offer__slider-next'),
      currentSlide = document.querySelector('#current'),
      totalSlides = document.querySelector('#total');

   let slideIndex = 1;

   showSlides(slideIndex);

   if (slides.length < 10) {
      totalSlides.textContent = `0${slides.length}`;
   } else {
      totalSlides.textContent = slides.length;
   }

   function showSlides(n) {
      if (n > slides.length) {
         slideIndex = 1;
      }
      if (n < 1) {
         slideIndex = slides.length;
      }

      slides.forEach(item => item.style.display = 'none');

      slides[slideIndex - 1].style.display = 'block';

      if (slides.length < 10) {
         currentSlide.textContent = `0${slideIndex}`;
      } else {
         currentSlide.textContent = slideIndex;
      }
   }

   function plusSlideIndex(n) {
      showSlides(slideIndex += n);
   }

   prevSlide.addEventListener('click', () => {
      plusSlideIndex(-1);
   });

   nextSlide.addEventListener('click', () => {
      plusSlideIndex(1);
   });

});
