package es.ual.dra.autodiagnostico.service.user;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import es.ual.dra.autodiagnostico.dto.AuthUserResponseDTO;
import es.ual.dra.autodiagnostico.dto.UpdatePasswordRequestDTO;
import es.ual.dra.autodiagnostico.dto.UpdateUserRequestDTO;
import es.ual.dra.autodiagnostico.model.entitity.user.AppUser;
import es.ual.dra.autodiagnostico.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthUserResponseDTO getUserById(Long id) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        return mapToResponse(user);
    }

    @Override
    public AuthUserResponseDTO updateUser(Long id, UpdateUserRequestDTO request) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
            if (!email.equals(user.getEmail()) && userRepository.existsByEmailIgnoreCase(email)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese correo");
            }
            user.setEmail(email);
        }

        if (request.getCity() != null) {
            user.setCity(request.getCity().trim());
        }

        if (request.getPostalCode() != null) {
            user.setPostalCode(request.getPostalCode().trim());
        }

        return mapToResponse(userRepository.save(user));
    }

    @Override
    public void updatePassword(Long id, UpdatePasswordRequestDTO request) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contrasena actual no es correcta");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        userRepository.delete(user);
    }

    @Override
    public AuthUserResponseDTO updateAvatar(Long id, String avatarUrl) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        user.setAvatarUrl(avatarUrl);
        return mapToResponse(userRepository.save(user));
    }

    private AuthUserResponseDTO mapToResponse(AppUser user) {
        return AuthUserResponseDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .city(user.getCity())
                .postalCode(user.getPostalCode())
                .build();
    }
}
