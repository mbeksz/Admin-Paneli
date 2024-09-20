var shipPrice = 0;

document.addEventListener('DOMContentLoaded', function () {
    fetchOrderDetail();
});

function fetchOrderDetail() {
    const idInput = document.getElementById('order-id-input').value;
    const xhttp_detail = new XMLHttpRequest();
    xhttp_detail.onload = function () {
        if (this.status === 200) {
            const detail = JSON.parse(this.responseText);
            console.log('Siparis detay:', detail);

            document.getElementById("email").innerHTML = detail.options.email;
            document.getElementById("website").innerHTML = detail.options.site_path;
            document.getElementById("contact-no").innerHTML = detail.options.phone_1;
            document.getElementById("address-details").innerHTML = detail.options.address;
            document.getElementById("invoice-no").innerHTML = detail.page.id;
            document.getElementById("invoice-date").innerHTML = detail.page.create_time;
            document.getElementById("payment-status").innerHTML = detail.page.status;
            document.getElementById("billing-name").innerHTML = detail.page.name + (detail.page.surname ? ' ' + detail.page.surname : '');
            document.getElementById("billing-address-line-1").innerHTML = detail.page.address + ' | ' + detail.page.city + ' | ' + detail.page.country;
            document.getElementById("billing-phone-no").innerHTML = detail.page.phone;
            document.getElementById("billing-email-no").innerHTML = detail.page.email;
            document.getElementById("products-list").innerHTML = "";

            var products_list = Object.values(detail.order_items);
            shipPrice = detail.page.cargoPrice;

            var counter = 1;
            var product_data = '';
            var subtotal = 0;

            products_list.forEach(function (element) {
                var variationUnitDiscountedPrice = parseFloat(element.variation_unit_discounted_price);
                var discountedUnitPrice = parseFloat(element.discounted_unit_price);
                var quantity = parseInt(element.quantity);
                var rowUnit = (variationUnitDiscountedPrice + discountedUnitPrice);
                var rowUnitFormatted = rowUnit.toFixed(2).replace('.', ',');
                var rowTotal = quantity * (variationUnitDiscountedPrice + discountedUnitPrice);
                subtotal += rowTotal;
                var rowTotalFormatted = rowTotal.toFixed(2).replace('.', ',');
                var variationAttributeContent = '';

                if (element.variations && element.attributes) {
                    const variationsArray = element.variations;
                    const attributesArray = element.attributes;
                    const maxLength = Math.min(variationsArray.length, attributesArray.length);

                    for (let i = 0; i < maxLength; i++) {
                        const variation = variationsArray[i];
                        const attribute = attributesArray[i];
                        const variationValue = variation.value;
                        const attributeValue = attribute.value;

                        variationAttributeContent += `<p class="title-p bottom0">${variationValue} : ${attributeValue}</p>`;
                    }
                }

                product_data += `
        <tr>
            <th scope="row">` + counter + `</th>
            <td class="text-start">
                <span class="fw-medium">` + element.product_title + `</span>
                <p class="text-muted mb-0 " style="margin-top: 10px";>` + variationAttributeContent + `</p>
            </td>
            <td>${rowUnitFormatted}</td>
            <td>` + element.quantity + `</td>
            <td class="text-end">${rowTotalFormatted}</td>
        </tr>`;
                counter++;
            });


            var subtotalFormatted = subtotal.toFixed(2).replace('.', ',');
if (shipPrice > 0) {
    subtotal += shipPrice;
}

var grandtotalFormatted = subtotal.toFixed(2).replace('.', ',');



            document.getElementById("products-list").innerHTML = product_data;

            var order_summary = `
            <tr class="border-top border-top-dashed mt-2">
                <td colspan="3"></td>
                <td colspan="2" class="fw-medium p-0">
                    <table class="table table-borderless text-start table-nowrap align-middle mb-0">
                        <tbody>
                            <tr>
                                <td>Ara toplam</td>
                        <td class="text-end">${subtotalFormatted}</td>
                            </tr>
                           
                            <tr>
                                <td>Kargo ücreti</td>
<td id="ship" class="text-end">` + (shipPrice > 0 ? shipPrice : 'Ücretsiz') + `</td>
                            </tr>
                            <tr class="border-top border-top-dashed">
                                <th scope="row">Toplam fiyat</th>
                        <td class="text-end">${grandtotalFormatted}</td>
                            </tr>
                        </tbody>
                    </table><!--end table-->
                </td>
            </tr>`;
            document.getElementById("products-list").innerHTML += order_summary;
            document.getElementById("total-amount").innerHTML = grandtotalFormatted;
            document.getElementById("card-total-amount").innerHTML = grandtotalFormatted;
                        if (detail.page.payment_type) {
    document.getElementById("payment-method").innerHTML = detail.page.payment_type;
    document.getElementById("payment-method-line").style.display = 'block';
} else {
    document.getElementById("payment-method-line").style.display = 'none';
}

        } else {
            console.error('Order detay覺 getirilemedi:', this.status);
        }
    };
    xhttp_detail.onerror = function () {
        console.error('襤stek hatas覺');
    };
    xhttp_detail.open("GET", `/Yonetici/api/orders.php?id=${idInput}`);
    xhttp_detail.send();
}



function toggleDropdown() {
    var dropdownMenu = document.getElementById("dropdownMenu");
    if (dropdownMenu.style.display === "block") {
        dropdownMenu.style.display = "none";
    } else {
        dropdownMenu.style.display = "block";
    }
}

function updateStatus(status) {
    var id = document.getElementById("order-id-input").value;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/Yonetici/api/orders.php?id=" + id, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            alert("Sipariş durumu güncellendi: " + status);
            toggleDropdown();
            
            location.reload();
        }
    };
    var data = JSON.stringify({
        status: status,
        id: id
    });
    xhr.send(data);
}
