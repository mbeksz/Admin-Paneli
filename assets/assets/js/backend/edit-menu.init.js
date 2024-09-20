document.addEventListener('DOMContentLoaded', function () {
    let menuPageData = [];
    let pages = [];

    // Function to fetch pages data
    function fetchPages() {
        const xhttp = new XMLHttpRequest();
        xhttp.onload = function () {
            if (this.status === 200) {
                pages = JSON.parse(this.responseText);
                console.log('Pages:', pages);
                fetchMenuDetail();
            } else {
                console.error('Failed to fetch pages:', this.status);
            }
        };
        xhttp.onerror = function () {
            console.error('Request error');
        };
        xhttp.open("GET", "/Yonetici/api/pages.php");
        xhttp.send();
    }

    // Function to fetch menu detail
    function fetchMenuDetail() {
        const idInput = document.getElementById('page-id-input').value;
        const xhttp_detail = new XMLHttpRequest();
        xhttp_detail.onload = function () {
            if (this.status === 200) {
                const detail = JSON.parse(this.responseText);
                console.log('Detail:', detail);
                document.getElementById('page-title-input').value = detail.name;
                renderMenus(detail.menus);
                // Populate menuPageData
                detail.menus.forEach(menu => {
                    menuPageData.push({
                        menuName: menu.name,
                        menuDescription: menu.sub_page_url,
        site_url: menu.site_url !== null && menu.site_url !== undefined && menu.site_url !== 'null' ? menu.site_url : "", 
                          pageSelection: menu.page_id
                    });
                });
                console.log('Initial menuPageData:', menuPageData);
                updateSelectOptions(); // Update select options after initial load
            } else {
                console.error('Failed to fetch menu detail:', this.status);
            }
        };
        xhttp_detail.onerror = function () {
            console.error('Request error');
        };
        xhttp_detail.open("GET", `/Yonetici/api/menus.php?id=${idInput}`);
        xhttp_detail.send();
    }

    // Function to render menus in the UI
    function renderMenus(menus) {
        const tbody = document.querySelector('tbody');
        tbody.innerHTML = '';

        menus.forEach(menu => {
            const newRow = createMenuRow(menu);
            tbody.appendChild(newRow);
        });
    }

    // Function to create a row for each menu item
  function createMenuRow(menu) {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td contenteditable='true'>${menu.name}</td>
        <td contenteditable='true'>${menu.sub_page_url}</td>
          <td contenteditable='true'>${menu.site_url}</td>
        <td>
            <select class='form-select'>
                <option value='' selected>Sayfa seçin</option>
            </select>
        </td>
        <td>
            <button class='btn btn-danger cancel-btn'>Cancel</button>
        </td>
    `;

    // Populate select options
    const selectElement = newRow.querySelector('select');
    pages.forEach(page => {
        const option = document.createElement('option');
        option.value = page.id;
        option.textContent = page.page_title;

        if (page.id == menu.page_id) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });

    // Event listener for cancel button
    newRow.querySelector('.cancel-btn').addEventListener('click', function () {
        newRow.remove();
        updateMenuPageData();
    });

    return newRow;
}


    // Function to update menuPageData based on UI changes
    function updateMenuPageData() {
        menuPageData = [];
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const menuName = row.querySelector('td:nth-child(1)').innerText.trim();
            const menuDescription = row.querySelector('td:nth-child(2)').innerText.trim();
            const site_url = row.querySelector('td:nth-child(3)').innerText.trim();

            const pageSelection = row.querySelector('select').value;

            menuPageData.push({
                menuName: menuName,
                menuDescription: menuDescription,
                site_url:site_url,
                pageSelection: pageSelection
            });
        });

        console.log('Updated menuPageData:', menuPageData);
        updateSelectOptions();
    }

    // Function to update select options in the UI
    function updateSelectOptions() {
        const selectElement = document.getElementById('choices-menu-input');
        if (selectElement) {
            selectElement.innerHTML = '';

            menuPageData.forEach((data) => {
                const option = document.createElement('option');
                option.value = data.pageSelection;
                option.textContent = data.menuName;
                selectElement.appendChild(option);
            });
        }
    }

    // Fetch initial data on page load
    fetchPages();

    // Event listener for adding a new menu row
    document.querySelector('.edit-btn').addEventListener('click', function () {
        const tbody = document.querySelector('tbody');
        const newRow = createMenuRow({ name: '', sub_page_url: '',site_url: '', page_id: '' });
        tbody.appendChild(newRow);

        // Event listener for cancel button in the new row
        newRow.querySelector('.cancel-btn').addEventListener('click', function () {
            newRow.remove();
        });

        // Event listener for save button in the new row
        newRow.querySelector('.save-btn').addEventListener('click', function () {
            const newMenuName = newRow.querySelector('td:nth-child(1)').innerText.trim();
            const newMenuDescription = newRow.querySelector('td:nth-child(2)').innerText.trim();
            const newsite_url = newRow.querySelector('td:nth-child(3)').innerText.trim();

            const newPageSelection = newRow.querySelector('select').value;

            if (newMenuName && newPageSelection) {
                menuPageData.push({
                    menuName: newMenuName,
                    menuDescription: newMenuDescription,
                    newsite_url:newsite_url,
                    pageSelection: newPageSelection
                });

                console.log('New Menu Added:', menuPageData);
                updateSelectOptions();
                newRow.remove();
            } else {
                alert('Please fill in all fields!');
            }
        });
    });
    const idInput = document.getElementById('page-id-input');

    // Event listener for saving settings
    document.getElementById("save_settings").addEventListener('click', function () {
                updateMenuPageData();
        const formData = {
            page_title: document.getElementById('page-title-input').value,
            menuData: menuPageData,
            page_id:idInput.value
        };


        const xhttp_createPage = new XMLHttpRequest();
        xhttp_createPage.onload = function () {
            if (this.status === 201) {
                alert('Menu güncellendi!');
                setTimeout(function () {
                    window.location.href = "/Yonetici/menus.php";
                }, 2000);
            } else {
                alert('Güncellenirken hata oluştu!');
            }
        };
        xhttp_createPage.onerror = function () {
            alert('Request error!');
        };
        
        xhttp_createPage.open("POST", "/Yonetici/api/menus.php?id="+idInput.value);
        xhttp_createPage.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp_createPage.send(JSON.stringify(formData));
    });
});
