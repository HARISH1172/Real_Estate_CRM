package com.crm.realEstae.controller;

import com.crm.realEstae.dto.AuthResponseDTO;
import com.crm.realEstae.dto.LoginRequestDTO;
import com.crm.realEstae.dto.RegisterRequestDTO;
import com.crm.realEstae.service.AuthService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/send-otp")
    public String sendOtp(@RequestParam String email) {
        return authService.sendOtp(email);
    }

    @PostMapping("/register")
    public AuthResponseDTO register(@RequestBody RegisterRequestDTO dto) {
        return authService.register(dto);
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@RequestBody LoginRequestDTO dto) {
        return authService.login(dto);
    }
}
