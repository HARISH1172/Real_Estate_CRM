package com.crm.realEstae.service;

import com.crm.realEstae.dto.PropertyDTO;
import com.crm.realEstae.entity.Property;
import com.crm.realEstae.entity.User;
import com.crm.realEstae.repository.PropertyRepository;
import com.crm.realEstae.repository.UserRepository;
import com.crm.realEstae.repository.LeadRepository;
import com.crm.realEstae.repository.SiteVisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.security.core.context.SecurityContextHolder;
import com.crm.realEstae.entity.enums.Role;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final LeadRepository leadRepository;
    private final SiteVisitRepository siteVisitRepository;

    public PropertyDTO createProperty(PropertyDTO dto) {
        Property property = new Property();
        updatePropertyFromDTO(property, dto);
        Property saved = propertyRepository.save(property);
        return mapToDTO(saved);
    }

    public List<PropertyDTO> getAllProperties() {
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == Role.AGENT) {
            // If Agent has no manager, they see NOTHING
            if (currentUser.getAssignedManager() == null) {
                return java.util.List.of();
            }
            // Otherwise they see properties assigned to them
            return propertyRepository.findByAssignedAgent(currentUser).stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }

        if (currentUser.getRole() == Role.MANAGER) {
            // Managers see properties assigned to them
            return propertyRepository.findByAssignedManager(currentUser).stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }

        // Admins see all
        return propertyRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    public List<PropertyDTO> getPropertiesByManager(String email) {
        User manager = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Manager not found"));
        return propertyRepository.findByAssignedManager(manager).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<PropertyDTO> getPropertiesByAgent(String email) {
        User agent = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Agent not found"));
        return propertyRepository.findByAssignedAgent(agent).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public PropertyDTO updateProperty(UUID id, PropertyDTO dto) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        updatePropertyFromDTO(property, dto);
        Property saved = propertyRepository.save(property);
        return mapToDTO(saved);
    }

    public void assignToManager(UUID propertyId, String managerEmail) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        
        if (property.getAssignedManager() != null) {
            throw new RuntimeException("Property assignment to manager is permanent and cannot be changed or removed");
        }

        if (managerEmail == null || managerEmail.trim().isEmpty()) {
            throw new RuntimeException("Manager email is required for assignment");
        }

        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new RuntimeException("Manager not found"));
        
        // City check: Manager can only manage properties in their jurisdiction
        String managerCity = manager.getAssignedCity();
        String propertyCity = property.getAddress() != null ? property.getAddress().getCity() : "";
        
        if (managerCity == null || propertyCity == null || !managerCity.equalsIgnoreCase(propertyCity)) {
            throw new RuntimeException("Regional Constraint: Manager jurisdiction is " + (managerCity != null ? managerCity : "none") + 
                " and cannot manage properties in " + (propertyCity != null ? propertyCity : "unknown"));
        }
        
        property.setAssignedManager(manager);
        propertyRepository.save(property);
    }

    public void assignToAgent(UUID propertyId, String agentEmail) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        
        if (agentEmail == null || agentEmail.trim().isEmpty()) {
            property.setAssignedAgent(null);
        } else {
            User agent = userRepository.findByEmail(agentEmail)
                    .orElseThrow(() -> new RuntimeException("Agent not found"));
            property.setAssignedAgent(agent);
        }
        propertyRepository.save(property);
    }

    @Transactional
    public void deleteProperty(UUID id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        // 2. Delete associated Site Visits
        siteVisitRepository.deleteByProperty(property);

        // 3. Delete the property itself
        propertyRepository.delete(property);
    }

    private void updatePropertyFromDTO(Property property, PropertyDTO dto) {
        property.setName(dto.getName());
        property.setDescription(dto.getDescription());
        property.setPrice(dto.getPrice());
        property.setType(dto.getType());
        property.setAddress(dto.getAddress());

        if (dto.getAssignedManagerId() != null) {
            userRepository.findById(dto.getAssignedManagerId()).ifPresent(property::setAssignedManager);
        }
        if (dto.getAssignedAgentId() != null) {
            userRepository.findById(dto.getAssignedAgentId()).ifPresent(property::setAssignedAgent);
        }
    }

    private PropertyDTO mapToDTO(Property property) {
        PropertyDTO dto = new PropertyDTO();
        dto.setId(property.getId());
        dto.setName(property.getName());
        dto.setDescription(property.getDescription());
        dto.setPrice(property.getPrice());
        dto.setType(property.getType());
        dto.setAddress(property.getAddress());
        dto.setCreatedAt(property.getCreatedAt());

        if (property.getAssignedManager() != null) {
            dto.setAssignedManagerId(property.getAssignedManager().getId());
            dto.setAssignedManagerName(property.getAssignedManager().getName());
        }
        if (property.getAssignedAgent() != null) {
            dto.setAssignedAgentId(property.getAssignedAgent().getId());
            dto.setAssignedAgentName(property.getAssignedAgent().getName());
        }
        return dto;
    }
}
