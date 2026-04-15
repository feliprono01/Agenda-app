package com.consultorio.backend.scheduler;

import com.consultorio.backend.entity.Turno;
import com.consultorio.backend.repository.TurnoRepository;
import com.consultorio.backend.service.WhatsAppService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class RecordatorioScheduler {

    private final TurnoRepository turnoRepository;
    private final WhatsAppService whatsAppService;

    // Corre todos los días a las 10:00 AM
    @Scheduled(cron = "0 0 10 * * *")
    public void enviarRecordatorios() {
        LocalDate manana = LocalDate.now().plusDays(1);
        List<Turno> turnos = turnoRepository.findTurnosPendientesDeRecordatorio(manana);
        log.info("Procesando {} recordatorios para el {}", turnos.size(), manana);

        for (Turno turno : turnos) {
            boolean enviado = whatsAppService.enviarRecordatorio(turno);
            if (enviado) {
                turno.setRecordatorioEnviado(true);
                turnoRepository.save(turno);
            }
        }
    }
}
