package com.consultorio.backend.service;

import com.consultorio.backend.dto.TurnoRequest;
import com.consultorio.backend.dto.TurnoResponse;
import com.consultorio.backend.entity.EstadoTurno;
import com.consultorio.backend.entity.Turno;
import com.consultorio.backend.entity.Paciente;
import com.consultorio.backend.repository.PacienteRepository;
import com.consultorio.backend.repository.TurnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
        Paciente paciente = pacienteRepository.findById(request.pacienteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Paciente no encontrado con id: " + request.pacienteId()));
        Turno turno = new Turno();
        turno.setPaciente(paciente);
        turno.setFechaHora(request.fechaHora());
        turno.setDuracionMinutos(request.duracionMinutos() != null ? request.duracionMinutos() : 30);
        turno.setMotivo(request.motivo());
        turno.setEstado(EstadoTurno.PENDIENTE);
        
        Turno turnoGuardado = turnoRepository.save(turno);

        // Enviar mensaje de WhatsApp en un hilo del pool gestionado por Spring (@Async)
        whatsappService.enviarRecordatorioAsync(turnoGuardado);

        return mapToResponse(turnoGuardado);
    }

    public TurnoResponse actualizarTurno(Long id, TurnoRequest request) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Turno no encontrado con id: " + id));
        if (request.pacienteId() != null && !turno.getPaciente().getId().equals(request.pacienteId())) {
            Paciente paciente = pacienteRepository.findById(request.pacienteId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Paciente no encontrado con id: " + request.pacienteId()));
            turno.setPaciente(paciente);
        }
        if (request.fechaHora() != null) turno.setFechaHora(request.fechaHora());
        if (request.duracionMinutos() != null) turno.setDuracionMinutos(request.duracionMinutos());
        if (request.motivo() != null) turno.setMotivo(request.motivo());
        return mapToResponse(turnoRepository.save(turno));
    }

    public void cancelarTurno(Long id) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Turno no encontrado con id: " + id));
        turno.setEstado(EstadoTurno.CANCELADO);
        turnoRepository.save(turno);
    }

    public TurnoResponse confirmarTurno(Long id) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Turno no encontrado con id: " + id));
        if (turno.getEstado() == EstadoTurno.CANCELADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No se puede confirmar un turno cancelado");
        }
        turno.setEstado(EstadoTurno.CONFIRMADO);
        return mapToResponse(turnoRepository.save(turno));
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
