package com.consultorio.backend.service;

import com.consultorio.backend.dto.TurnoRequest;
import com.consultorio.backend.dto.TurnoResponse;
import com.consultorio.backend.entity.EstadoTurno;
import com.consultorio.backend.entity.Turno;
import com.consultorio.backend.entity.Paciente;
import com.consultorio.backend.repository.PacienteRepository;
import com.consultorio.backend.repository.TurnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TurnoService {

    private final TurnoRepository turnoRepository;
    private final PacienteRepository pacienteRepository;
    private final WhatsAppService whatsappService;

    public List<TurnoResponse> getTurnosPorRango(String desde, String hasta) {
        LocalDateTime fDesde = LocalDate.parse(desde).atStartOfDay();
        LocalDateTime fHasta = LocalDate.parse(hasta).atTime(23, 59, 59);
        return turnoRepository.findByFechaHoraBetweenOrderByFechaHoraAsc(fDesde, fHasta)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TurnoResponse crearTurno(TurnoRequest request) {
        Paciente paciente = pacienteRepository.findById(request.pacienteId()).orElseThrow();
        Turno turno = new Turno();
        turno.setPaciente(paciente);
        turno.setFechaHora(request.fechaHora());
        turno.setDuracionMinutos(request.duracionMinutos() != null ? request.duracionMinutos() : 30);
        turno.setMotivo(request.motivo());
        turno.setEstado(EstadoTurno.PENDIENTE);
        
        Turno turnoGuardado = turnoRepository.save(turno);
        
        // Disparar mensaje de WhatsApp asincrónicamente o en un hilo separado
        new Thread(() -> {
            whatsappService.enviarRecordatorio(turnoGuardado);
        }).start();

        return mapToResponse(turnoGuardado);
    }

    public TurnoResponse actualizarTurno(Long id, TurnoRequest request) {
        Turno turno = turnoRepository.findById(id).orElseThrow();
        if (request.pacienteId() != null && !turno.getPaciente().getId().equals(request.pacienteId())) {
            Paciente paciente = pacienteRepository.findById(request.pacienteId()).orElseThrow();
            turno.setPaciente(paciente);
        }
        if (request.fechaHora() != null) turno.setFechaHora(request.fechaHora());
        if (request.duracionMinutos() != null) turno.setDuracionMinutos(request.duracionMinutos());
        if (request.motivo() != null) turno.setMotivo(request.motivo());
        return mapToResponse(turnoRepository.save(turno));
    }

    public void cancelarTurno(Long id) {
        Turno turno = turnoRepository.findById(id).orElseThrow();
        turno.setEstado(EstadoTurno.CANCELADO);
        turnoRepository.save(turno);
    }

    private TurnoResponse mapToResponse(Turno t) {
        return new TurnoResponse(
                t.getId(),
                t.getPaciente().getId(),
                t.getPaciente().getNombre() + " " + t.getPaciente().getApellido(),
                t.getFechaHora(),
                t.getDuracionMinutos(),
                t.getMotivo(),
                t.getEstado().name()
        );
    }
}
