package com.crm.realEstae.service;

import com.crm.realEstae.dto.RegisterRequestDTO;
import com.crm.realEstae.entity.User;
import com.crm.realEstae.entity.enums.Role;
import com.crm.realEstae.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public String createManager(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(Role.MANAGER);
        user.setApproved(true);
        user.setAddress(request.getAddress());

        userRepository.save(user);
        return "Manager created successfully";
    }

    public String updateUser(String email, RegisterRequestDTO request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        userRepository.save(user);
        return "User updated successfully";
    }

    public String deleteUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
        return "User deleted successfully";
    }

    public String approveAgent(String agentEmail, String managerEmail) {
        User agent = userRepository.findByEmail(agentEmail)
                .orElseThrow(() -> new RuntimeException("Agent not found"));
        
        if (agent.getRole() != Role.AGENT) {
            throw new RuntimeException("User is not an agent");
        }

        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager not found"));
        
        if (manager.getRole() != Role.MANAGER) {
            throw new RuntimeException("User is not a manager");
        }

        agent.setApproved(true);
        agent.setAssignedManager(manager);
        userRepository.save(agent);
        
        return "Agent approved and assigned to manager successfully";
    }
}
