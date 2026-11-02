package com.apexstreet.repository;

import com.apexstreet.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Collection;
import com.apexstreet.model.Role;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRoleIn(Collection<Role> roles);

    @Query("SELECT u.password FROM User u")
    List<String> findAllPasswordHashes();
}
