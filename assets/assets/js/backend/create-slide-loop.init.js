function addRemoveSlideEvent(button) {
            button.addEventListener('click', function() {
                let slideInfo = button.closest('.slide-info');
                slideInfo.remove();
                updateSlideNumbers();
            });
        }

        function updateSlideNumbers() {
            let slideInfos = document.querySelectorAll('.slide-info');
            slideInfos.forEach((slide, index) => {
                slide.querySelector('h4').innerHTML = `${index + 1}. Slide Bilgileri <button type="button" class="btn-close remove-slide ms-2 fs-14" aria-label="Close"></button>`;
                addRemoveSlideEvent(slide.querySelector('.remove-slide'));
            });
        }

        document.getElementById('new_slide_create').addEventListener('click', function() {
            let slideContainer = document.getElementById('slide-container');
            let slideCount = slideContainer.getElementsByClassName('slide-info').length;
            let newSlide = document.createElement('div');
            newSlide.classList.add('slide-info');
            newSlide.innerHTML = `
                <hr>
                <h4 class="mb-3">${slideCount + 1}. Slide Bilgileri <button type="button" class="btn-close remove-slide ms-2 fs-14" aria-label="Close"></button></h4>
               
                <div class="mb-3">
                    <input type="text" class="form-control" name="description[]" value="" placeholder="Slide açıklaması giriniz" required>
                    <div class="invalid-feedback">Slide açıklaması giriniz.</div>
                </div>
                <div class="mb-3">
                    <input type="text" class="form-control" name="order_number[]" value="" placeholder="Slide sıra numarası giriniz" required>
                    <div class="invalid-feedback">Slide sıra numarası giriniz.</div>
                </div>
                <div class="mb-3">
                    <input type="text" class="form-control" name="button_name[]" value="" placeholder="Slide buton ismi giriniz" required>
                    <div class="invalid-feedback">Slide buton ismi giriniz.</div>
                </div>
                <div class="mb-3">
                    <input type="text" class="form-control" name="button_link[]" value="" placeholder="Slide buton linki giriniz" required>
                    <div class="invalid-feedback">Slide buton linki giriniz.</div>
                </div>
                <div class="mb-3">
                    <input type="text" class="form-control" name="image_path[]" value="" placeholder="Slide resim adresi giriniz" required>
                    <div class="invalid-feedback">Slide resim adresi giriniz.</div>
                </div>
                
                
            `;
            slideContainer.appendChild(newSlide);
            addRemoveSlideEvent(newSlide.querySelector('.remove-slide'));
        });

        // Add remove event to existing slide
        document.querySelectorAll('.remove-slide').forEach(button => {
            addRemoveSlideEvent(button);
        });