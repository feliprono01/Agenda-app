package com.consultorio.backend.controller;

import com.consultorio.backend.dto.PacienteRequest;
import com.consultorio.backend.dto.PacienteResponse;
import com.consultorio.backend.service.PacienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pacientes")
@RequiredArgsConstructor
public class PacienteController {

    private final PacienteService pacienteService;

    @GetMapping
    public ResponseEntity<List<PacienteResponse>> getAllPacientes() {
        return ResponseEntity.ok(pacienteService.getAllPacientes());
    }

    @PostMapping
    public ResponseEntity<PacienteResponse> createPaciente(@Valid @RequestBody PacienteRequest request) {
        return ResponseEntity.ok(pacienteService.createPaciente(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PacienteResponse> updatePaciente(@PathVariable Long id, @Valid @RequestBody PacienteRequest request) {
        return ResponseEntity.ok(pacienteService.updatePaciente(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaciente(@PathVariable Long id) {
        pacienteService.deletePaciente(id);
        return ResponseEntity.noContent().build();
    }
}
