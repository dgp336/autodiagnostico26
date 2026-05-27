package es.ual.dra.autodiagnostico.service.user;

import java.util.List;

import es.ual.dra.autodiagnostico.dto.AuthUserResponseDTO;
import es.ual.dra.autodiagnostico.dto.UpdatePasswordRequestDTO;
import es.ual.dra.autodiagnostico.dto.UpdateUserRequestDTO;

public interface UserService {
    List<AuthUserResponseDTO> listUsers();
    AuthUserResponseDTO getUserById(Long id);
    AuthUserResponseDTO updateUser(Long id, UpdateUserRequestDTO request);
    void updatePassword(Long id, UpdatePasswordRequestDTO request);
    void deleteUser(Long id);
    AuthUserResponseDTO updateAvatar(Long id, String avatarUrl);
    AuthUserResponseDTO upgradeRole(Long id, String newRole);
}
