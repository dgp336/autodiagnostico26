package es.ual.dra.autodiagnostico.service.user;

import es.ual.dra.autodiagnostico.dto.AuthUserResponseDTO;
import es.ual.dra.autodiagnostico.dto.UpdatePasswordRequestDTO;
import es.ual.dra.autodiagnostico.dto.UpdateUserRequestDTO;

public interface UserService {
    AuthUserResponseDTO getUserById(Long id);
    AuthUserResponseDTO updateUser(Long id, UpdateUserRequestDTO request);
    void updatePassword(Long id, UpdatePasswordRequestDTO request);
    void deleteUser(Long id);
    AuthUserResponseDTO updateAvatar(Long id, String avatarUrl);
}
