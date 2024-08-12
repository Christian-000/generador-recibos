function validateForm(formData) {
  let errors = [];

  // Validación del día
  if (!formData.day) {
    errors.push("El día es requerido.");
  } else {
    const day = parseInt(formData.day, 10);
    if (isNaN(day) || day < 1 || day > 31) {
      errors.push("El día debe ser un número entre 01 y 31.");
    }
  }

  // Validación del mes
  if (!formData.month) {
    errors.push("El mes es requerido.");
  }

  // Validación del año
  if (!formData.year) {
    errors.push("El año es requerido.");
  } else {
    const year = parseInt(formData.year, 10);
    if (isNaN(year) || year < 0 || year > 99) {
      errors.push("El año debe ser un número de dos dígitos entre 00 y 99.");
    }
  }

  // Validación del monto
  if (!formData.amount) {
    errors.push("El monto es requerido.");
  } else {
    // Validar el formato del monto (acepta tanto "100.000,50" como "100000,50")
    const amountRegex = /^\d{1,3}(\.\d{3})*(\,\d{1,2})?$|^\d+\,\d{1,2}$/;
    if (!amountRegex.test(formData.amount)) {
      errors.push("El monto debe tener un formato válido (ej: 100.000,50 o 100000,50).");
    } else {
      // Transformar el monto al formato requerido
      formData.amount = formData.amount.replace(/\./g, '').replace(',', '.');
    }
  }

  // Validación del concepto
  if (formData.concepto && formData.concepto.length > 255) {
    errors.push("El concepto no puede exceder los 255 caracteres.");
  }

  return errors;
}

function showCustomAlert(title, message) {
  const alertElement = document.getElementById('custom-alert');
  const titleElement = document.getElementById('alert-title');
  const messageElement = document.getElementById('alert-message');
  const closeButton = document.getElementById('alert-close');

  titleElement.textContent = title;
  messageElement.textContent = message;
  alertElement.style.display = 'block';

  closeButton.onclick = function() {
    alertElement.style.display = 'none';
  }

  // Cierra la alerta si se hace click fuera de ella
  window.onclick = function(event) {
    if (event.target == alertElement) {
      alertElement.style.display = 'none';
    }
  }
}

document.getElementById("generate-pdf").addEventListener("click", async () => {
  const formData = {
    day: document.getElementById("day").value,
    month: document.getElementById("month").value,
    year: document.getElementById("year").value,
    name: document.getElementById("name").value,
    amount: document.getElementById("amount").value,
    concepto: document.getElementById("concepto").value,
  };
  
  // Validación de campos requeridos
  const errors = validateForm(formData);

  if (errors.length > 0) {
    // Si hay errores, mostrarlos en la alerta personalizada
    showCustomAlert('Error de validación', errors.join('\n'));
    return;
  }

  try {
    await window.electronAPI.send("generate-pdf", {
      formData,
      outputPath: "./recibo.pdf",
    });
    
    // Limpiar los campos de concepto y amount
    document.getElementById("amount").value = '';
    document.getElementById("concepto").value = '';
    
    showCustomAlert('Éxito', 'PDF creado correctamente.');
  } catch (error) {
    showCustomAlert('Error', 'Hubo un problema al generar el PDF.');
  }
});

// Funcion para lanzar notificaciones nativas de windows
function notifyUser(title, text) {
  Notification.requestPermission().then((result) => {
    new Notification(title, {
      body: text,
    });
  });
}
