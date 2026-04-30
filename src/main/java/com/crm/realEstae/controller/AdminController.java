package com.crm.realEstae.controller;

import com.crm.realEstae.dto.RegisterRequestDTO;
import com.crm.realEstae.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminService adminService;
    private final com.crm.realEstae.repository.UserRepository userRepository;

    @GetMapping("/agents")
    @PreAuthorize("hasRole('ADMIN')")
    public java.util.List<com.crm.realEstae.dto.UserDTO> getAllAgents() {
        return adminService.getAllAgents();
    }

    @GetMapping("/managers")
    @PreAuthorize("hasRole('ADMIN')")
    public java.util.List<com.crm.realEstae.dto.UserDTO> getAllManagers() {
        return adminService.getAllManagers();
    }

    @PostMapping("/create-manager")
    @PreAuthorize("hasRole('ADMIN')")
    public String createManager(@RequestBody RegisterRequestDTO request) {
        return adminService.createManager(request);
    }

    @PutMapping("/user/{email:.+}")
    @PreAuthorize("hasRole('ADMIN')")
    public String updateUser(@PathVariable String email, @RequestBody RegisterRequestDTO request) {
        return adminService.updateUser(email, request);
    }

    @DeleteMapping("/user/{email:.+}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteUser(@PathVariable String email) {
        return adminService.deleteUser(email);
    }

    @PatchMapping("/approve-agent/{agentEmail:.+}")
    @PreAuthorize("hasRole('ADMIN')")
    public String approveAgent(@PathVariable String agentEmail, @RequestParam String managerEmail) {
        return adminService.approveAgent(agentEmail, managerEmail);
    }

    @PatchMapping("/agents/{email:.+}/assign-manager")
    @PreAuthorize("hasRole('ADMIN')")
    public void assignManagerToAgent(@PathVariable String email, @RequestParam(required = false) String managerEmail) {
        adminService.assignManagerToAgent(email, managerEmail);
    }
}
