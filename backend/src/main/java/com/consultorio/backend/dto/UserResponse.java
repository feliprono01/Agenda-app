package com.consultorio.backend.dto;

import com.consultorio.backend.entity.Role;
import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String email,
        String nombre,
        Role role,
        LocalDateTime createdAt
) {}
