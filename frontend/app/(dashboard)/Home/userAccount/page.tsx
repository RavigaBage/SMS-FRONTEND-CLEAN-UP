"use client";

import React, { useState, useEffect } from 'react';
import '@/styles/userAcc.css';
import { apiRequest } from '@/src/lib/apiClient';
import Pagination from '@/src/assets/components/dashboard/Pagnation';
import Loading from '@/src/assets/components/dashboard/loader';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'headmaster' | 'bursar' | 'teacher';
  role_display: string;
  is_active: boolean;
  last_login: string | null;
  date_joined: string;
  created_by_username: string | null;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

interface CreateUserForm {
  username: string;
  email: string;
  password: string;
  role: string;
  is_active: boolean;
}

export default function UserAccounts() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [fetchLoader, setfetchLoader] = useState(false);
  
  // Pagination
  const [pagination, setPagination] = useState<PaginatedResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<CreateUserForm>({
    username: '',
    email: '',
    password: '',
    role: '',
    is_active: true,
  });
  
  // Password reset state
  const [resetPasswordData, setResetPasswordData] = useState({
    userId: 0,
    newPassword: '',
    confirmPassword: '',
  });
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery || searchQuery === '') {
        fetchUsers();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let endpoint = `/users/?page=${currentPage}`;
      
      if (roleFilter) {
        endpoint += `&role=${roleFilter}`;
      }
      
      if (statusFilter) {
        endpoint += `&is_active=${statusFilter}`;
      }
      
      if (searchQuery) {
        endpoint += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await apiRequest<User>(endpoint);
      
      if (response.results) {
        setUsers(response.results);
        setPagination({
          count: response.count || 0,
          next: response.next || null,
          previous: response.previous || null,
          results: response.results,
        });
      } else {
        const data = response.data;

        if (Array.isArray(data)) {
          setUsers(data.filter((u): u is User => u !== null));
        } else if (data) {
          setUsers([data]);
        } else {
          setUsers([]);
        }
              }
    } catch (error) {
      console.error('Error fetching users:', error);
      showMessage('error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setfetchLoader(true);
    
    if (!formData.username || !formData.email || !formData.password || !formData.role) {
      showMessage('error', 'Please fill in all required fields');
      return;
    }
    
    try {
      await apiRequest('/users/', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      
      showMessage('success', 'User created successfully');
      setModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      showMessage('error', error.message || 'Failed to create user');
    }
    setfetchLoader(false);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setfetchLoader(true);
    
    if (!selectedUser) return;
    
    try {
      await apiRequest(`/users/${selectedUser.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          role: formData.role,
          is_active: formData.is_active,
        }),
      });
      
      showMessage('success', 'User updated successfully');
      setModalOpen(false);
      setIsEditMode(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      showMessage('error', error.message || 'Failed to update user');
    }
    setfetchLoader(false);
  };

  const handleDeactivateUser = async (userId: number, currentStatus: boolean) => {

    const action = currentStatus ? 'deactivate' : 'activate';
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }
    
    try {
      await apiRequest(`/users/${userId}/${action}/`, {
        method: 'POST',
      });
      
      showMessage('success', `User ${action}d successfully`);
      fetchUsers();
    } catch (error: any) {
      console.error(`Error ${action}ing user:`, error);
      showMessage('error', error.message || `Failed to ${action} user`);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }
    
    if (resetPasswordData.newPassword.length < 10) {
      showMessage('error', 'Password must be at least 10 characters long');
      return;
    }
    
    try {
      setfetchLoader(true);
      await apiRequest(`/users/${resetPasswordData.userId}/change_password/`, {
        method: 'POST',
        body: JSON.stringify({
          new_password: resetPasswordData.newPassword,
          confirm_password: resetPasswordData.confirmPassword,
        }),
      });
      
      showMessage('success', 'Password reset successfully');
      setIsResetPasswordModalOpen(false);
      setResetPasswordData({ userId: 0, newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      showMessage('error', error.message || 'Failed to reset password');
    }
    setfetchLoader(false);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      is_active: user.is_active,
    });
    setIsEditMode(true);
    setModalOpen(true);
  };

  const openResetPasswordModal = (userId: number) => {
    setResetPasswordData({ userId, newPassword: '', confirmPassword: '' });
    setIsResetPasswordModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: '',
      is_active: true,
    });
    setSelectedUser(null);
    setIsEditMode(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="dashboardWrapper">
      <div className="dashboard">
        
        {/* Message Alert */}
        {message && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '12px 20px',
              borderRadius: '8px',
              backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: message.type === 'success' ? '#065f46' : '#991b1b',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              zIndex: 1000,
              fontWeight: 500,
            }}
          >
            {message.text}
          </div>
        )}

        {/* Header */}
        <header className="header">
          <div>
            <h1>User Accounts</h1>
            <p>Manage system users, roles, and access</p>
          </div>
          <button
            className="primaryBtn"
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
          >
            Create User
          </button>
        </header>

        {/* Search and Filters */}
        <div className="controls">
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="headmaster">Headmaster</option>
            <option value="bursar">Bursar</option>
            <option value="teacher">Teacher</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Users Table */}
        <main className="card">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading users...</div>
          ) : users.length > 0 ? (
            <>
              <table className="userTable">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Created By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td style={{ fontWeight: 600 }}>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.role_display}</td>
                      <td>
                        <span
                          className={`statusBadge ${
                            user.is_active ? 'activeStatus' : 'inactiveStatus'
                          }`}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{formatDate(user.last_login)}</td>
                      <td>{user.created_by_username || 'System'}</td>
                      <td>
                        <div className="actionGroup">
                          <button
                            className="actionBtn btnEdit"
                            onClick={() => openEditModal(user)}
                          >
                            Edit
                          </button>
                          <button
                            className="actionBtn btnDeactivate"
                            onClick={() => handleDeactivateUser(user.id, user.is_active)}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className="actionBtn btnReset"
                            onClick={() => openResetPasswordModal(user.id)}
                          >
                            Reset Password
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination && pagination.count > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <Pagination
                    count={pagination.count}
                    next={pagination.next}
                    previous={pagination.previous}
                    currentPage={currentPage}
                    onPageChange={(newPage) => setCurrentPage(newPage)}
                  />
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              No users found
            </div>
          )}
        </main>

        {/* Create/Edit User Modal */}
        {isModalOpen && (
          <div className="modalOverlay" onClick={() => {
            setModalOpen(false);
            resetForm();
          }}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
              <div> {fetchLoader ? <Loading /> : ''}</div>
              <h2>{isEditMode ? 'Edit User' : 'Create New User'}</h2>
              
              <form onSubmit={isEditMode ? handleUpdateUser : handleCreateUser}>
                <label className="modalLabel">Username <span className="text-red-500">*</span></label>
                <input
                  className="modalInput"
                  type="text"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />

                <label className="modalLabel">Email <span className="text-red-500">*</span></label>
                <input
                  className="modalInput"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                {!isEditMode && (
                  <>
                    <label className="modalLabel">Password <span className="text-red-500">*</span></label>
                    <input
                      className="modalInput"
                      type="password"
                      placeholder="Enter password (min 10 characters)"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      minLength={10}
                      required
                    />
                  </>
                )}

                <label className="modalLabel">Role <span className="text-red-500">*</span></label>
                <select
                  className="modalInput"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Administrator</option>
                  <option value="headmaster">Headmaster</option>
                  <option value="bursar">Bursar</option>
                  <option value="teacher">Teacher</option>
                </select>

                <label className="modalLabel">Status <span className="text-red-500">*</span></label>
                <select
                  className="modalInput"
                  value={formData.is_active ? 'true' : 'false'}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.value === 'true' })
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>

                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                    marginTop: '20px',
                  }}
                >
                  <button
                    type="button"
                    className="secondaryBtn"
                    onClick={() => {
                      setModalOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primaryBtn">
                    {isEditMode ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {isResetPasswordModalOpen && (
          <div className="modalOverlay" onClick={() => setIsResetPasswordModalOpen(false)}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
              <h2>Reset User Password</h2>
              <div> {fetchLoader ? <Loading /> : ''}</div>
              
              <form onSubmit={handleResetPassword}>
                <label className="modalLabel">New Password <span className="text-red-500">*</span></label>
                <input
                  className="modalInput"
                  type="password"
                  placeholder="Enter new password (min 10 characters)"
                  value={resetPasswordData.newPassword}
                  onChange={(e) =>
                    setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })
                  }
                  minLength={10}
                  required
                />

                <label className="modalLabel">Confirm Password <span className="text-red-500">*</span></label>
                <input
                  className="modalInput"
                  type="password"
                  placeholder="Confirm new password"
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) =>
                    setResetPasswordData({
                      ...resetPasswordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  minLength={10}
                  required
                />

                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                    marginTop: '20px',
                  }}
                >
                  <button
                    type="button"
                    className="secondaryBtn"
                    onClick={() => setIsResetPasswordModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primaryBtn">
                    Reset Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}