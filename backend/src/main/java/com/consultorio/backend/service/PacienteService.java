package com.consultorio.backend.service;

import com.consultorio.backend.dto.PacienteRequest;
import com.consultorio.backend.dto.PacienteResponse;
import com.consultorio.backend.entity.Paciente;
import com.consultorio.backend.repository.PacienteRepository;
import com.consultorio.backend.repository.TurnoRepository;
import com.consultorio.backend.entity.Turno;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final TurnoRepository turnoRepository;

    public List<PacienteResponse> getAllPacientes() {
        return pacienteRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PacienteResponse createPaciente(PacienteRequest request) {
        Paciente paciente = new Paciente();
        updatePacienteEntity(paciente, request);
        return mapToResponse(pacienteRepository.save(paciente));
    }

    public PacienteResponse updatePaciente(Long id, PacienteRequest request) {
        Paciente paciente = pacienteRepository.findById(id).orElseThrow();
        updatePacienteEntity(paciente, request);
        return mapToResponse(pacienteRepository.save(paciente));
    }

    public void deletePaciente(Long id) {
        List<Turno> turnosAsociados = turnoRepository.findAll().stream()
                .filter(t -> t.getPaciente().getId().equals(id))
                .collect(Collectors.toList());
        turnoRepository.deleteAll(turnosAsociados);
        pacienteRepository.deleteById(id);
    }

    private void updatePacienteEntity(Paciente paciente, PacienteRequest request) {
        paciente.setNombre(request.nombre());
        paciente.setApellido(request.apellido());
        paciente.setTelefono(request.telefono());
        paciente.setEmail(request.email());
        paciente.setDni(request.dni());
        paciente.setFechaNacimiento(request.fechaNacimiento());
        paciente.setObservaciones(request.observaciones());
    }

    private PacienteResponse mapToResponse(Paciente p) {
        return new PacienteResponse(
                p.getId(), p.getNombre(), p.getApellido(), p.getTelefono(),
                p.getEmail(), p.getDni(), p.getFechaNacimiento(), p.getObservaciones()
        );
    }
}
