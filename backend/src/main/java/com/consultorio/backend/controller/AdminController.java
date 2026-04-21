package com.consultorio.backend.controller;

import com.consultorio.backend.dto.CreateUserRequest;
import com.consultorio.backend.dto.UpdateUserRequest;
import com.consultorio.backend.dto.UserResponse;
import com.consultorio.backend.scheduler.RecordatorioScheduler;
import com.consultorio.backend.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final RecordatorioScheduler recordatorioScheduler;

    // ── Gestión de usuarios ──────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createUser(request));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id,
                                                   @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(adminService.updateUser(id, request));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ── Utilidades ───────────────────────────────────────────────

    @PostMapping("/test-recordatorio")
    public ResponseEntity<String> testRecordatorio() {
        recordatorioScheduler.enviarRecordatorios();
        return ResponseEntity.ok("Scheduler disparado manualmente");
    }
}

