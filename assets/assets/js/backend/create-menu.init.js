document.addEventListener('DOMContentLoaded', function () {
    let menuPageData = [];
    let pages = []; 

    const addMenuBtn = document.querySelector('.edit-btn');
    addMenuBtn.addEventListener('click', function () {
        const tbody = document.querySelector('tbody');

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td contenteditable='true'></td>
            <td contenteditable='true'></td>
            <td contenteditable='true'></td>
            <td>
                <select id="choices-menu-input" class='form-select'>
                <option value='' selected>Sayfa seçin</option>
                </select>
            </td>
            <td>
                <button class='btn btn-danger cancel-btn'>İptal</button>
            </td>
        `;

        const xhttp = new XMLHttpRequest();
        xhttp.onload = function () {
            if (xhttp.status === 200) {
                json_records = JSON.parse(this.responseText);
                pages = json_records; // Gelen tüm sayfaları pages dizisine kaydediyoruz

                const selectHeader = newRow.querySelector('#choices-menu-input');
                selectHeader.innerHTML = '<option value="" selected>Sayfa seçin</option>'; 

                pages.forEach(page => {
                    const option = document.createElement('option');
                    option.value = page.id;
                    option.textContent = page.page_title;
                    selectHeader.appendChild(option);
                });
            } else {
                console.error('Failed to fetch data');
            }
        };

        xhttp.onerror = function () {
            console.error('Request error');
        };
        xhttp.open("GET", "/Yonetici/api/pages.php");
        xhttp.send();

        tbody.appendChild(newRow);

        // İptal butonuna tıklama işlevi
        newRow.querySelector('.cancel-btn').addEventListener('click', function () {
            newRow.remove();
            // İptal edilen satırı menuPageData dizisinden kaldır
            const rowIndex = Array.from(tbody.children).indexOf(newRow);
            if (rowIndex !== -1) {
                menuPageData.splice(rowIndex, 1);
                console.log('Güncellenmiş Menü Verisi:', menuPageData);
            }
        });

        // Her satır eklendiğinde, o satırın verilerini menuPageData dizisine ekliyoruz
        newRow.addEventListener('input', function () {
            const rowIndex = Array.from(tbody.children).indexOf(newRow);
            const newMenuName = newRow.querySelector('td:nth-child(1)').innerText.trim();
            const newMenuDescription = newRow.querySelector('td:nth-child(2)').innerText.trim(); 
            const newSite_url = newRow.querySelector('td:nth-child(3)').innerText.trim(); 
            const newPageSelection = newRow.querySelector('select').value;

            const newData = {
                menuName: newMenuName,
                menuDescription: newMenuDescription,
                pageSelection: newPageSelection,
                site_url: newSite_url
            };

            if (rowIndex >= 0) {
                // Satır mevcutsa, veriyi güncelle
                menuPageData[rowIndex] = newData;
            } else {
                // Satır yeni ise, veriyi ekle
                menuPageData.push(newData);
            }

            console.log('Geçerli Menü Verisi:', menuPageData);
        });
    });

    document.getElementById("save_settings").addEventListener('click', function () {
        const pageTitle = document.getElementById('page-title-input').value.trim();

        if (!pageTitle) {
            alert('Lütfen sayfa başlığını doldurun.');
            return; // Veriyi göndermeyi durdur
        }

        const formData = {
            page_title: pageTitle,
            menuData: menuPageData
        };

        console.log('Gönderilecek Form Verisi:', JSON.stringify(formData)); 

        const xhttp_createPage = new XMLHttpRequest();
        xhttp_createPage.onload = function () {
            if (this.status === 201) {
                alert('Menü Oluşturuldu!');
                setTimeout(function () {
                    window.location.href = "/Yonetici/menus.php";
                }, 2000);
            } else {
                alert('Sayfa oluşturulamadı!');
            }
        };
        xhttp_createPage.onerror = function () {
            alert('Hata oluştu!');
        };
        xhttp_createPage.open("POST", "/Yonetici/api/menus.php");
        xhttp_createPage.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp_createPage.send(JSON.stringify(formData));
    });
});
