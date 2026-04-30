package com.crm.realEstae.service;

import com.crm.realEstae.dto.RegisterRequestDTO;
import com.crm.realEstae.dto.UserDTO;
import com.crm.realEstae.entity.User;
import com.crm.realEstae.entity.enums.Role;
import com.crm.realEstae.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final com.crm.realEstae.repository.LeadRepository leadRepository;

    public java.util.List<com.crm.realEstae.dto.UserDTO> getAllAgents() {
        return userRepository.findByRole(Role.AGENT).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public java.util.List<com.crm.realEstae.dto.UserDTO> getAllManagers() {
        return userRepository.findByRole(Role.MANAGER).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO convertToDTO(User user) {
        com.crm.realEstae.dto.UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setAddress(user.getAddress());
        dto.setAssignedCity(user.getAssignedCity());
        dto.setApproved(user.isApproved());
        dto.setStatus(user.isApproved() ? "APPROVED" : "PENDING");
        dto.setCreatedAt(user.getCreatedAt());
        
        if (user.getRole() == Role.MANAGER) {
            dto.setAgentCount(userRepository.countByAssignedManager(user));
        } else if (user.getRole() == Role.AGENT) {
            dto.setLeadCount(leadRepository.countByAssignedAgent(user));
        }
        
        if (user.getAssignedManager() != null) {
            dto.setManagerEmail(user.getAssignedManager().getEmail());
            dto.setManagerName(user.getAssignedManager().getName());
        }
        
        return dto;
    }

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
        user.setAssignedCity(request.getAssignedCity());
        user.setAddress(request.getAddress());

        userRepository.save(user);
        return "Manager created successfully";
    }

    public String updateUser(String email, RegisterRequestDTO request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setAssignedCity(request.getAssignedCity());
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

        if (agent.getAssignedManager() != null) {
            throw new RuntimeException("Agent already has an assigned manager");
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

    public void assignManagerToAgent(String agentEmail, String managerEmail) {
        User agent = userRepository.findByEmail(agentEmail)
                .orElseThrow(() -> new RuntimeException("Agent not found"));
        
        if (agent.getAssignedManager() != null) {
            throw new RuntimeException("Manager assignment is permanent and cannot be changed or removed");
        }

        if (managerEmail == null || managerEmail.trim().isEmpty()) {
            throw new RuntimeException("Manager email is required for assignment");
        }

        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager not found"));
        agent.setAssignedManager(manager);
        userRepository.save(agent);
    }
}
