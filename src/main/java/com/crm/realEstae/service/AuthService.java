package com.crm.realEstae.service;

import com.crm.realEstae.dto.AuthResponseDTO;
import com.crm.realEstae.dto.LoginRequestDTO;
import com.crm.realEstae.dto.RegisterRequestDTO;
import com.crm.realEstae.entity.User;
import com.crm.realEstae.entity.enums.Role;
import com.crm.realEstae.otp.EmailService;
import com.crm.realEstae.otp.OtpStore;
import com.crm.realEstae.repository.UserRepository;
import com.crm.realEstae.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OtpStore otpStore;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Send OTP
    public String sendOtp(String email) {

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        otpStore.saveOtp(email, otp);
        emailService.sendOtp(email, otp);

        return "OTP sent successfully";
    }

    //  Register (WITH OTP VALIDATION)
    public AuthResponseDTO register(RegisterRequestDTO request) {

        // Verify OTP
        boolean isValidOtp = otpStore.verifyOtp(request.getEmail(), request.getOtp());

        if (!isValidOtp) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("User already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());

        // Registration is ONLY for AGENTS
        user.setRole(Role.AGENT);
        user.setApproved(false);

        user.setAddress(request.getAddress());

        userRepository.save(user);

        return buildResponse(user, null);
    }

    //  Login
    public AuthResponseDTO login(LoginRequestDTO request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!user.isApproved()) {
            throw new RuntimeException("You are not approved yet, please wait for admin approval.");
        }

        String token = jwtUtil.generateToken(user);

        return buildResponse(user, token);
    }

    private AuthResponseDTO buildResponse(User user, String token) {
        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(token);
        response.setRole(user.getRole());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        return response;
    }
}