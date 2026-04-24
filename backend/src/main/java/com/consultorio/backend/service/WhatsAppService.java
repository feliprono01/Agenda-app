package com.consultorio.backend.service;

import com.consultorio.backend.entity.Turno;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class WhatsAppService {

    @Value("${whatsapp.api.url}")
    private String apiUrl;

    @Value("${whatsapp.phone.number.id}")
    private String phoneNumberId;

    @Value("${whatsapp.access.token}")
    private String accessToken;

    @Value("${whatsapp.template.name}")
    private String templateName;

    @Value("${whatsapp.template.language}")
    private String templateLanguage;

    private final RestTemplate restTemplate;

    public boolean enviarRecordatorio(Turno turno) {
        String url = apiUrl + "/" + phoneNumberId + "/messages";

        // 1. Quitar todo lo que no sea dígito
        String digits = turno.getPaciente().getTelefono().replaceAll("[^\\d]", "");

        // 2. Normalizar a formato internacional argentino (sin +)
        //    Casos: "3424787555" (10 dig) → "5493424787555"
        //           "03424787555" (11 dig, 0 local) → "5493424787555"
        //           "543424787555" (12 dig, sin 9 de celular) → "5493424787555"
        //           "5493424787555" (13 dig, correcto) → sin cambio
        String telefono;
        if (digits.startsWith("549") && digits.length() == 13) {
            telefono = digits; // ya está completo
        } else if (digits.startsWith("54") && digits.length() == 12) {
            telefono = "549" + digits.substring(2); // falta el 9 de celular
        } else if (digits.startsWith("0") && digits.length() == 11) {
            telefono = "549" + digits.substring(1); // quitar el 0 y agregar 549
        } else if (digits.length() == 10) {
            telefono = "549" + digits; // número local sin código
        } else {
            telefono = digits; // otros casos: dejar como está
        }

        String nombre = turno.getPaciente().getNombre();
        String fecha = turno.getFechaHora().toLocalDate()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String hora = turno.getFechaHora().toLocalTime()
                .format(DateTimeFormatter.ofPattern("HH:mm"));

        Map<String, Object> body = Map.of(
                "messaging_product", "whatsapp",
                "to", telefono,
                "type", "template",
                "template", Map.of(
                        "name", templateName,
                        "language", Map.of("code", templateLanguage),
                        "components", List.of(Map.of(
                                "type", "body",
                                "parameters", List.of(
                                        Map.of("type", "text", "text", nombre),
                                        Map.of("type", "text", "text", fecha),
                                        Map.of("type", "text", "text", hora)
                                )
                        ))
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            restTemplate.postForEntity(url, new HttpEntity<>(body, headers), String.class);
            log.info("Recordatorio enviado a {} para turno {}", telefono, turno.getId());
            return true;
        } catch (Exception e) {
            log.error("Error enviando recordatorio al turno {}: {}", turno.getId(), e.getMessage());
            return false;
        }
    }

    /**
     * Versión asíncrona para llamar desde TurnoService al crear un turno.
     * Spring ejecuta este método en el pool de hilos gestionado (@EnableAsync).
     */
    @Async
    public CompletableFuture<Boolean> enviarRecordatorioAsync(Turno turno) {
        boolean resultado = enviarRecordatorio(turno);
        return CompletableFuture.completedFuture(resultado);
    }
}
