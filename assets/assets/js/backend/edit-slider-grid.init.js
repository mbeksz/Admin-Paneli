let slider = [];
let sliders = [];
let productList = [];
let productIdsByTab = {};

function removeTr(index) {
    slider[index] && slider[index].selectItem.destroy();  
    slider.splice(index, 1);
    document.getElementById('slider-item-' + index).remove();
    sliders = sliders.filter(sliderItem => sliderItem.id !== index);
    console.log(slider);
}
document.addEventListener('DOMContentLoaded', function () {

    function fetchProducts() {
        return new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function () {
                if (xhttp.status === 200) {
                    resolve(JSON.parse(this.responseText));
                } else {
                    reject('Failed to fetch products');
                }
            };
            xhttp.onerror = function () {
                reject('Request error');
            };
            xhttp.open("GET", "/Yonetici/api/products.php");
            xhttp.send();
        });
    }

    function fetchSliderDetails(id) {
        return new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function () {
                if (this.status === 200) {
                    resolve(JSON.parse(this.responseText));
                } else {
                    reject('Failed to fetch slider details');
                }
            };
            xhttp.onerror = function () {
                reject('Request error');
            };
            xhttp.open("GET", `/Yonetici/api/sliders.php?id=${id}`);
            xhttp.send();
        });
    }

    function fetchSliders(id) {
        return new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function () {
                if (this.status === 200) {
                    resolve(JSON.parse(this.responseText));
                } else {
                    reject('Failed to fetch sliders');
                }
            };
            xhttp.onerror = function () {
                reject('Request error');
            };
            xhttp.open("GET", `/Yonetici/api/sliders.php?slider_id=${id}`);
            xhttp.send();
        });
    }

    function create_tr(index, sliderData = {}) {
        return `
            <td><input class="form-control" required name="tab-input-name" id="tab-input-name-${index}" type="text" value="${sliderData.tabName || ''}"></td>
            <td style="max-height:75px;"><select class="form-control" type="select-multiple" id="product-select-input-${index}" multiple></select></td>
            <td><label for="checkbox-${index}">Başlığı göster</label><input type="checkbox" id="checkbox-${index}" name="checkbox-${index}" ${sliderData.checkbox === 1 ? 'checked' : ''}></td>
            <td><button class='btn btn-danger cancel-btn' onclick="removeTr(${index})">İptal</button></td>
        `;
    }

    function populateSliders(sliders) {
        const tbody = document.querySelector('tbody');
        sliders.forEach(sliderItem => {
            const newRow = document.createElement('tr');
            newRow.id = 'slider-item-' + sliderItem.id;
            newRow.innerHTML = create_tr(sliderItem.id, { tabName: sliderItem.name, checkbox: sliderItem.show_tab_name });
            tbody.appendChild(newRow);

            slider[sliderItem.id] = {
                tabName: sliderItem.name || '',
                checkbox: sliderItem.show_tab_name ? 1 : 0,
                selectItem: new Choices('#product-select-input-' + sliderItem.id, {
                    removeItemButton: true,
                })
            };

            const formattedProductList = productList.map(product => ({
                id: product.id,
                title: product.title
            }));

            slider[sliderItem.id].selectItem.setChoices(formattedProductList, 'id', 'title', false);

            const initialValues = productIdsByTab[sliderItem.id] || [];
            initialValues.forEach(productId => {
                slider[sliderItem.id].selectItem.setChoiceByValue(productId.toString());
            });

            slider[sliderItem.id].selectItem.passedElement.element.addEventListener('addItem', function (event) {
                const productId = parseInt(event.detail.value);
                console.log(`Product ${productId} added`);
                const sliderIndex = sliders.findIndex(slider => slider.id === sliderItem.id);
                if (sliderIndex !== -1) {
                    sliders[sliderIndex].products.push({ product_id: productId });
                }
            });

            slider[sliderItem.id].selectItem.passedElement.element.addEventListener('removeItem', function (event) {
                const productId = parseInt(event.detail.value);
                console.log(`Product ${productId} removed`);
                const sliderIndex = sliders.findIndex(slider => slider.id === sliderItem.id);
                if (sliderIndex !== -1) {
                    sliders[sliderIndex].products = sliders[sliderIndex].products.filter(product => product.product_id !== productId);
                }
            });

            document.getElementById(`tab-input-name-${sliderItem.id}`).addEventListener('input', function (event) {
                slider[sliderItem.id].tabName = event.target.value;
                console.log(sliderItem.id, slider[sliderItem.id].tabName);
            });

            document.getElementById(`checkbox-${sliderItem.id}`).addEventListener('input', function (event) {
                slider[sliderItem.id].checkbox = event.target.checked ? 1 : 0;
                console.log(sliderItem.id, slider[sliderItem.id].checkbox);
            });
        });
    }



    async function initialize() {
        try {
            const idInput = document.getElementById('page-id-input').value;
            productList = await fetchProducts();
            const detail = await fetchSliderDetails(idInput);
            document.getElementById('page-title-input').value = detail.name;

            sliders = await fetchSliders(idInput);
            console.log('Tab Değerleri:', sliders);

            productIdsByTab = {};
            sliders.forEach(slider => {
                productIdsByTab[slider.id] = [];
                slider.products.forEach(product => {
                    productIdsByTab[slider.id].push(product.product_id);
                });
            });

            console.log('Tab IDsine göre ürünler:', productIdsByTab);

            if (productList.length > 0) {
                populateSliders(sliders);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const addMenuBtn = document.querySelector('.edit-btn');
    addMenuBtn.addEventListener('click', function () {
        const tbody = document.querySelector('tbody');
        const index = slider.length;
        const newRow = document.createElement('tr');
        newRow.id = 'slider-item-' + index;
        newRow.innerHTML = create_tr(index);
        tbody.appendChild(newRow);

        slider[index] = {
            tabName: '',
            checkbox: 0,
            selectItem: new Choices('#product-select-input-' + index, {
                removeItemButton: true,
            })
        };

        slider[index].selectItem.setChoices(productList, 'id', 'title', false);

        document.getElementById(`tab-input-name-${index}`).addEventListener('input', function (event) {
            slider[index].tabName = event.target.value;
        });

        document.getElementById(`checkbox-${index}`).addEventListener('input', function (event) {
            slider[index].checkbox = event.target.checked ? 1 : 0;
        });
    });

    document.getElementById("save_settings").addEventListener('click', function () {
        const pageTitle = document.getElementById("page-title-input").value;
        if (!pageTitle) {
            alert('Başlık alanı boş olamaz!');
            return;
        }
        const newTabData = slider.filter(sliderItem => sliderItem.tabName !== '').map(sliderItem => ({
            tabName: sliderItem.tabName,
            items: sliderItem.selectItem ? sliderItem.selectItem.getValue(true) : [],
            checkbox: sliderItem.checkbox
        }));

        // const existingTabsData = sliders.map(sliderItem => ({
        //     id: sliderItem.id,
        //     tabName: sliderItem.name,
        //     items: sliderItem.products.map(product => product.product_id),
        //     checkbox: sliderItem.show_tab_name ? 1 : 0
        // }));   

        const formData = {
            title: pageTitle,
            tabs: newTabData,   // ilk yüklenenle yeniler ayrı ayrı yollanıyordu şuan birlikte yollanıyor
            // tabs: existingTabsData,
        };

        const xhttp = new XMLHttpRequest();
        xhttp.onload = function () {
            if (this.status === 200) {
                alert('Slider Güncellendi!');
                setTimeout(() => window.location.href = "/Yonetici/slider-grid.php", 2000);
            } else {
                alert('Failed to save settings!');
            }
        };
        xhttp.onerror = function () {
            alert('Request error!');
        };
        const idInput = document.getElementById('page-id-input').value;
        xhttp.open("POST", `/Yonetici/api/sliders.php?id=${idInput}`);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp.send(JSON.stringify(formData));
    });

    initialize();
});
