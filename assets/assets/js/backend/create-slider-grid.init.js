document.addEventListener('DOMContentLoaded', function () {
    let menuPageData = [];
    let pages = [];
    let productList = []

    var slider = []

    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        if (xhttp.status === 200) {
            const json_records = JSON.parse(this.responseText);
            productList = json_records

        } else {
            console.error('Failed to fetch data');
        }
    };
    xhttp.onerror = function () {
        console.error('Request error');
    };
    xhttp.open("GET", "/Yonetici/api/products.php");
    xhttp.send();

    function create_tr(index){

        const trHtml = `
            <td><input class="form-control" required name="tab-input-name" id="tab-input-name-${index}" type="text""></td>
            <td style="max-height:75px; over"><select class="form-control" type="select-multiple" id="product-select-input-${index}" multiple></select></td>
            <td><button class='btn btn-danger cancel-btn' id="deleteTR-${index}" >İptal</button></td>
            <td><label for="checkbox-${index}">Başlığı göster</label><input type="checkbox" id="checkbox-${index}" name="checkbox-${index}" checked></td>

        `;

        return trHtml

    }

    function removeTr(index){
        slider.splice(index,1)
        document.getElementById('slider-item-'+index).remove()
    }


    const addMenuBtn = document.querySelector('.edit-btn');
    addMenuBtn.addEventListener('click', function () {
        const tbody = document.querySelector('tbody');

        const newRow = document.createElement('tr');
        const index = slider.length
        newRow.id = 'slider-item-'+index
        newRow.innerHTML =create_tr(index);

        slider.push({
            tabName:'',
            selectItem:null,
            checkbox: true
        })

        tbody.appendChild(newRow);


        document.getElementById(`tab-input-name-${index}`).addEventListener('input', function (event) {
            slider[index].tabName = event.target.value;
        });
        
        document.getElementById(`checkbox-${index}`).addEventListener('change', function (event) {
            slider[index].checkbox = event.target.checked;
        });
        
        document.getElementById(`deleteTR-${index}`).addEventListener('click', function () {
            removeTr(index);
        });

        slider[index]['selectItem'] = new Choices('#product-select-input-'+index,{
            removeItemButton: true,
        });

        slider[index]['selectItem'].setChoices(productList, 'id', 'title', false);
        
    });

    document.getElementById("save_settings").addEventListener('click', function () {
        const pageTitle = document.getElementById("page-title-input").value;
        if (!pageTitle) {
                alert('Başlık alanı boş olamaz!');
                return; // Boş veri kontrolü yapıldı, fonksiyonu sonlandır
            }
        var newTabData = []

        slider.map((sliderItem)=>{
            console.log('item ',sliderItem)
            newTabData.push({
                tabName: sliderItem.tabName,
                items: sliderItem.selectItem.getValue(true),
                checkbox: sliderItem.checkbox ? 1 : 0, 
            })
        })

        const formData = {
            title: pageTitle,
            tabs: newTabData
        };


        const xhttp_createPage = new XMLHttpRequest();
        xhttp_createPage.onload = function () {
            if (this.status === 200) {
                alert('Slider Oluşturuldu!');
                setTimeout(function () {
                    window.location.href = "/Yonetici/slider-grid.php";
                }, 1000);
            } else {
                alert('Failed to create menu!');
            }
        };
        xhttp_createPage.onerror = function () {
            alert('Request error!');
        };
        xhttp_createPage.open("POST", "/Yonetici/api/sliders.php");
        xhttp_createPage.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp_createPage.send(JSON.stringify(formData));
    });

    
});
