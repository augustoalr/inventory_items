// Espera a que el contenido del DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    // Seleccionar los elementos del DOM que vamos a usar
    const itemForm = document.getElementById('itemForm');
    const itemList = document.getElementById('itemList');
    const submitButton = document.getElementById('submitButton');
    const exportPdfButton = document.getElementById('exportPdfButton');

    // Inicializar el array de items, cargando desde localStorage si existe
    let items = JSON.parse(localStorage.getItem('items')) || [];

    /**
     * Función para renderizar (dibujar) los items en la pantalla.
     */
    /**
 * Función para renderizar (dibujar) los items en la pantalla.
 */
const renderItems = () => {
    // Limpiar la lista actual para evitar duplicados
    itemList.innerHTML = '';

    // Si no hay items, muestra un mensaje
    if (items.length === 0) {
        itemList.innerHTML = '<p>No items added yet. Fill out the form to add your first item!</p>';
        return;
    }

    // Iterar sobre cada item y crear su HTML
    items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('item-card');
        
        // Usar una imagen por defecto si no se subió ninguna
        const imageSrc = item.image || 'https://via.placeholder.com/100?text=No+Image';

        itemElement.innerHTML = `
            <img src="${imageSrc}" alt="${item.description || 'Item image'}">
            <div class="item-details">
                <p><strong>Description:</strong> ${item.description || 'N/A'}</p>
                <p><strong>Price:</strong> AED ${item.price || '0.00'}</p>
                <p><strong>Location:</strong> ${item.location || 'N/A'}</p>
                ${item.contact ? `<p><strong>Contact:</strong> ${item.contact}</p>` : ''}
            </div>
            <div class="item-actions">
                ${item.link ? `<a href="${item.link}" target="_blank" class="gallery-btn">View Gallery</a>` : ''}
                <button class="edit-btn" data-index="${index}">Edit</button>
                <button class="delete-btn" data-index="${index}">Delete</button>
            </div>
        `;
        itemList.appendChild(itemElement);
    });
};

    /**
     * Función para guardar los items en el localStorage del navegador.
     */
    const saveItems = () => {
        localStorage.setItem('items', JSON.stringify(items));
    };

    /**
     * Función para manejar la compresión de la imagen.
     * @param {File} imageFile - El archivo de imagen a comprimir.
     * @returns {Promise<string>} - Una promesa que resuelve con la imagen comprimida en formato Base64.
     */
    const handleImageUpload = async (imageFile) => {
        // Opciones de compresión
        const options = {
            maxSizeMB: 1,          // Tamaño máximo del archivo en MB
            maxWidthOrHeight: 800, // Ancho o alto máximo
            useWebWorker: true     // Usar un worker para no bloquear la interfaz
        };

        try {
            console.log(`Original image size: ${(imageFile.size / 1024 / 1024).toFixed(2)} MB`);
            const compressedFile = await imageCompression(imageFile, options);
            console.log(`Compressed image size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
            
            // Convertir la imagen comprimida a Base64 para guardarla
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(compressedFile);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        } catch (error) {
            console.error('Image compression error:', error);
            alert('There was an error compressing the image.');
            return null;
        }
    };
    
    /**
     * Manejador del evento de envío del formulario.
     */
   /**
 * Manejador del evento de envío del formulario.
 */
itemForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevenir el envío tradicional del formulario

    // Obtener los valores del formulario
    const id = document.getElementById('itemId').value;
    const description = document.getElementById('itemDescription').value;
    const price = document.getElementById('itemPrice').value;
    const location = document.getElementById('itemLocation').value;
    const contact = document.getElementById('itemContact').value; // <-- NUEVO
    const link = document.getElementById('itemLink').value;       // <-- NUEVO
    const imageFile = document.getElementById('itemImage').files[0];
    
    let imageBase64 = null;
    if (imageFile) {
        // Mostrar un indicador de carga mientras se procesa la imagen
        submitButton.textContent = 'Processing Image...';
        submitButton.disabled = true;
        
        imageBase64 = await handleImageUpload(imageFile);

        submitButton.textContent = 'Add Item';
        submitButton.disabled = false;
    }

    // Si hay un ID, estamos editando. Si no, estamos creando.
    if (id) {
        // Lógica para editar un item existente
        const itemToEdit = items[id];
        itemToEdit.description = description;
        itemToEdit.price = price;
        itemToEdit.location = location;
        itemToEdit.contact = contact; // <-- NUEVO
        itemToEdit.link = link;       // <-- NUEVO
        
        // Solo actualiza la imagen si se subió una nueva
        if (imageBase64) {
            itemToEdit.image = imageBase64;
        }
    } else {
        // Lógica para crear un nuevo item
        const newItem = { description, price, location, contact, link, image: imageBase64 }; // <-- ACTUALIZADO
        items.push(newItem);
    }

    saveItems();
    renderItems();
    itemForm.reset(); // Limpiar el formulario
    document.getElementById('itemId').value = ''; // Limpiar el ID oculto
    submitButton.textContent = 'Add Item'; // Restaurar texto del botón
});

    /**
     * Manejador para los botones de Editar y Eliminar (usando delegación de eventos).
     */
    itemList.addEventListener('click', (e) => {
        // Lógica para eliminar un item
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.dataset.index;
            if (confirm('Are you sure you want to delete this item?')) {
                items.splice(index, 1); // Elimina 1 elemento en la posición 'index'
                saveItems();
                renderItems();
            }
        }

        // Lógica para editar un item
        if (e.target.classList.contains('edit-btn')) {
            const index = e.target.dataset.index;
            const item = items[index];

            // Rellenar el formulario con los datos del item
            document.getElementById('itemId').value = index;
            document.getElementById('itemDescription').value = item.description;
            document.getElementById('itemPrice').value = item.price;
            document.getElementById('itemLocation').value = item.location;
            document.getElementById('itemContact').value = item.contact || ''; // <-- AÑADIDO
            document.getElementById('itemLink').value = item.link || '';       // <-- AÑADIDO
            
            // Cambiar el texto del botón y hacer scroll hacia el formulario
            submitButton.textContent = 'Update Item';
            window.scrollTo(0, 0);
        }
    });

    /**
     * Manejador para el botón de exportar a PDF.
     */
   /**
 * Manejador para el botón de exportar a PDF, ahora con soporte para múltiples páginas.
 */
exportPdfButton.addEventListener('click', () => {
    // Si no hay items, no hacer nada.
    if (items.length === 0) {
        alert('There are no items to export.');
        return;
    }

    // Mostrar un estado de carga en el botón
    exportPdfButton.textContent = 'Generating PDF...';
    exportPdfButton.disabled = true;

    // Usamos la librería jsPDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' = portrait, 'mm' = millimeters, 'a4' = page size

    // Definir márgenes y dimensiones
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let y = margin; // 'y' es la posición vertical donde empezamos a dibujar

    // Título del documento
    pdf.setFontSize(18);
    pdf.text('My Moving Sale Items', pageWidth / 2, y, { align: 'center' });
    y += 10; // Mover la posición 'y' hacia abajo

    // Bucle para añadir cada item al PDF
    items.forEach((item, index) => {
        // Altura estimada de la tarjeta del item
        const itemCardHeight = 60; // Aumentamos la altura estimada para dar más espacio

        // --- Comprobación de Salto de Página ---
        // Si el siguiente item no cabe en la página actual, crea una nueva.
        if (y + itemCardHeight > pageHeight - margin) {
            pdf.addPage();
            y = margin; // Reiniciar la posición 'y' al margen superior en la nueva página
        }
        
        pdf.setLineWidth(0.5);
        pdf.line(margin, y, pageWidth - margin, y); // Línea separadora superior
        y += 5;

        // --- Dibujar la Imagen ---
        if (item.image) {
            try {
                pdf.addImage(item.image, 'PNG', margin, y, 30, 30); // Dibuja la imagen
            } catch (e) {
                console.error("Could not add image to PDF for item " + index, e);
                pdf.text("Image error", margin, y + 15);
            }
        } else {
            pdf.text("No image", margin, y + 15);
        }
        
        // --- Dibujar el Texto ---
        const textX = margin + 35; // Posición X para el texto, a la derecha de la imagen
        let textY = y + 5;
        
        pdf.setFontSize(12);
        pdf.text(`Description: ${item.description || 'N/A'}`, textX, textY);
        textY += 7;
        pdf.text(`Price: AED ${item.price || '0.00'}`, textX, textY);
        textY += 7;
        pdf.text(`Location: ${item.location || 'N/A'}`, textX, textY);

        if(item.contact){
            textY += 7;
            pdf.text(`Contact: ${item.contact}`, textX, textY);
        }

        if(item.link){
            textY += 7;
            pdf.setTextColor(0, 0, 255); // Color azul para el enlace
            pdf.textWithLink('View Gallery', textX, textY, { url: item.link });
            pdf.setTextColor(0, 0, 0); // Restaurar color negro
        }

        // Actualizar la posición 'y' para el siguiente item
        y += itemCardHeight;
    });

    // Guardar el PDF
    pdf.save('my-items-list.pdf');

    // Restaurar el estado del botón
    exportPdfButton.textContent = 'Export to PDF';
    exportPdfButton.disabled = false;
});

    // Renderizar los items iniciales al cargar la página
    renderItems();
});