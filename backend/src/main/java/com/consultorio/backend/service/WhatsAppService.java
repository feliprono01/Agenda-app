package com.consultorio.backend.service;

import com.consultorio.backend.entity.Turno;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

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

        // Limpiamos la cadena para que no tenga '+', guiones ni espacios.
        String telefono = turno.getPaciente().getTelefono().replaceAll("[^\\d]", "");
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
}
