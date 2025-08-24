function doGet(e){
  if (!e) {
    return ContentService.createTextOutput("Error: Esta función solo funciona desde la URL del Web App")
                         .setMimeType(ContentService.MimeType.TEXT);
  }

  var params = e.parameter;
  var action = params.action;

  if(action == "buscar"){
    return ContentService.createTextOutput(JSON.stringify(buscarHabitaciones(params.checkIn, params.checkOut, params.capacity)))
                         .setMimeType(ContentService.MimeType.JSON);
  } else if(action == "reservar"){
    return ContentService.createTextOutput(JSON.stringify(reservarHabitacion(params)))
                         .setMimeType(ContentService.MimeType.JSON);
  } else {
    return ContentService.createTextOutput("Acción no válida")
                         .setMimeType(ContentService.MimeType.TEXT);
  }
}

function buscarHabitaciones(checkIn, checkOut, capacity){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetHabitaciones = ss.getSheetByName("Habitaciones");
  var sheetReservas = ss.getSheetByName("Reservas");

  var habitaciones = sheetHabitaciones.getDataRange().getValues();
  var reservas = sheetReservas.getDataRange().getValues();
  var results = [];

  for(var i=1; i<habitaciones.length; i++){
    var habID = habitaciones[i][0];
    var tipo = habitaciones[i][1];
    var precio = habitaciones[i][2];
    var cap = habitaciones[i][3];
    var estado = habitaciones[i][4];
    var notas = habitaciones[i][5];
    var foto = habitaciones[i][6] || "";

    if(estado != "Disponible") continue;
    if(cap < parseInt(capacity)) continue;

    var disponible = true;
    for(var j=1; j<reservas.length; j++){
      if(reservas[j][5] == habID){
        var rCheckIn = new Date(reservas[j][6]);
        var rCheckOut = new Date(reservas[j][7]);
        if(!(new Date(checkOut) <= rCheckIn || new Date(checkIn) >= rCheckOut)){
          disponible = false;
          break;
        }
      }
    }
    if(disponible){
      results.push({id:habID, tipo:tipo, precio:precio, capacidad:cap, notas:notas, foto:foto});
    }
  }
  return results;
}

function reservarHabitacion(params){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetReservas = ss.getSheetByName("Reservas");
  var sheetHabitaciones = ss.getSheetByName("Habitaciones");

  var lastRow = sheetReservas.getLastRow() + 1;
  var habID = params.habID;

  sheetReservas.getRange(lastRow,1).setValue(lastRow-1);
  sheetReservas.getRange(lastRow,2).setValue(params.nombre);
  sheetReservas.getRange(lastRow,3).setValue(params.email);
  sheetReservas.getRange(lastRow,4).setValue(params.telefono);
  sheetReservas.getRange(lastRow,5).setValue(habID);
  sheetReservas.getRange(lastRow,6).setValue(params.checkIn);
  sheetReservas.getRange(lastRow,7).setValue(params.checkOut);
  sheetReservas.getRange(lastRow,8).setValue("Confirmada");

  var habitaciones = sheetHabitaciones.getDataRange().getValues();
  for(var i=1; i<habitaciones.length; i++){
    if(habitaciones[i][0] == habID){
      sheetHabitaciones.getRange(i+1,5).setValue("Reservada"); // <- corregido
      break;
    }
  }

  var body = "Tu reserva ha sido confirmada.\n\n" +
             "Habitación: " + habID + "\n" +
             "Check-in: " + params.checkIn + "\n" +
             "Check-out: " + params.checkOut + "\n\n" +
             "Gracias por elegir Hostal HDQ.";

  MailApp.sendEmail(params.email, "Confirmación de Reserva - Hostal HDQ", body);

  return {status:"ok", message:"Reserva confirmada"};
}
