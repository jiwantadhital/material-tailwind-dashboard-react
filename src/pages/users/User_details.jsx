import { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Avatar,
    Typography,
    Switch,
    Tooltip,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Textarea,
  } from "@material-tailwind/react";
  import { PencilIcon } from "@heroicons/react/24/solid";
  import { useLocation } from "react-router-dom";
import { authService } from "../../services/apiService";
  
  export default function UserDetails() {
    const location = useLocation();
    const userId = location.state?.user?.id;
    const [user, setUser] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
  
    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const response = await authService.getSingleUser(userId);
          setUser(response.data);
        } catch (error) {
          setAlertMessage(error.message || "Failed to fetch user data");
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
        }
      };
  
      if (userId) {
        fetchUserData();
      }
    }, [userId]);
  
    const handleKycAction = async (status) => {
      if (status === 'rejected' && user.kyc.kyc_status?.toLowerCase() !== 'pending') {
        return;
      }
      
      if (status === 'rejected') {
        setOpenDialog(true);
        return;
      }
      
      setIsApproving(true);
      try {
        const response = await authService.approveKyc(user.kyc.id, status);
  
        if (response.success) {
          setAlertMessage(response.message || "KYC status updated successfully");
          setShowAlert(true);
          const updatedUser = await authService.getSingleUser(userId);
          setUser(updatedUser.data);
          setTimeout(() => setShowAlert(false), 3000);
        }
      } catch (error) {
        setAlertMessage(error.message || "Failed to update KYC status");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } finally {
        setIsApproving(false);
      }
    };
  
    const handleReject = async () => {
      try {
        const response = await authService.approveKyc(user.kyc.id, "rejected", rejectionReason);
  
        if (response.success) {
          setOpenDialog(false);
          setRejectionReason("");
          setAlertMessage(response.message || "KYC rejected successfully");
          const updatedUser = await authService.getSingleUser(userId);
          setUser(updatedUser.data);
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
        }
      } catch (error) {
        setAlertMessage(error.message || "Failed to reject KYC");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    };
  
    const handleStatusChange = async (checked) => {
      setIsUpdatingStatus(true);
      try {
        const newStatus = checked ? true : false;
        const response = await authService.activeDeactiveUser(userId, newStatus);
        
        if (response.success) {
          setAlertMessage(response.message || "Account status updated successfully");
          setShowAlert(true);
          const updatedUser = await authService.getSingleUser(userId);
          setUser(updatedUser.data);
        }
      } catch (error) {
        setAlertMessage(error.message || "Failed to update account status");
        setShowAlert(true);
      } finally {
        setIsUpdatingStatus(false);
        setTimeout(() => setShowAlert(false), 3000);
      }
    };
  
    if (!user) {
      return <div>Loading...</div>;
    }
  
    return (
      <>
        {/* Success Alert */}
        {showAlert && (
          <div className="fixed top-4 right-4 z-50">
            <div className={`px-6 py-3 rounded-lg bg-green-100 text-green-700 border border-green-200`}>
              {alertMessage}
            </div>
          </div>
        )}
  
        {/* Rejection Reason Dialog */}
        <Dialog open={openDialog} handler={() => setOpenDialog(false)}>
          <DialogHeader>Provide Rejection Reason</DialogHeader>
          <DialogBody>
            <Textarea
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={() => setOpenDialog(false)}
              className="mr-1"
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              color="red"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Confirm Reject
            </Button>
          </DialogFooter>
        </Dialog>
  
        <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover	bg-center">
          <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
        </div>
        <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
          <CardBody className="p-4">
            <div className="mb-10 flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-6">
                <Avatar
                  src={`${user.kyc?.photo_url}`}
                  alt={user.name}
                  size="xl"
                  variant="rounded"
                  className="rounded-lg shadow-lg shadow-blue-gray-500/40"
                />
                <div>
                  <Typography variant="h5" color="blue-gray" className="mb-1">
                    {user.name}
                  </Typography>
                  <Typography variant="small" className="font-normal text-blue-gray-600">
                    Role: {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                  </Typography>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-full ${
                  user.status?.toLowerCase() === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
                }`}>
                  {user.status?.toUpperCase()}
                </div>
                <Tooltip content="Edit Profile">
                  <PencilIcon className="h-6 w-6 cursor-pointer text-blue-gray-500" />
                </Tooltip>
              </div>
            </div>
            <div className="mb-12 grid gap-12 px-4 lg:grid-cols-2 xl:grid-cols-3">
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  Personal Information
                </Typography>
                <ul className="flex flex-col gap-4">
                  <li className="flex items-center gap-4">
                    <Typography variant="small" color="blue-gray" className="font-semibold w-24">
                      Email:
                    </Typography>
                    <Typography variant="small" className="font-normal text-blue-gray-500">
                      {user.kyc?.email}
                    </Typography>
                  </li>
                  <li className="flex items-center gap-4">
                    <Typography variant="small" color="blue-gray" className="font-semibold w-24">
                      Phone:
                    </Typography>
                    <Typography variant="small" className="font-normal text-blue-gray-500">
                      {user.phone}
                    </Typography>
                  </li>
                  <li className="flex items-center gap-4">
                    <Typography variant="small" color="blue-gray" className="font-semibold w-24">
                      Address:
                    </Typography>
                    <Typography variant="small" className="font-normal text-blue-gray-500">
                      {user.kyc?.address}
                    </Typography>
                  </li>
                  <li className="flex items-center gap-4">
                    <Typography variant="small" color="blue-gray" className="font-semibold w-24">
                      Gender:
                    </Typography>
                    <Typography variant="small" className="font-normal text-blue-gray-500">
                      {user.kyc?.gender}
                    </Typography>
                  </li>
                  <li className="flex items-center gap-4">
                    <Typography variant="small" color="blue-gray" className="font-semibold w-24">
                      Date of Birth:
                    </Typography>
                    <Typography variant="small" className="font-normal text-blue-gray-500">
                      {new Date(user.kyc?.dob).toLocaleDateString()}
                    </Typography>
                  </li>
                </ul>
              </div>
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  Account Information
                </Typography>
                <ul className="flex flex-col gap-4">
                  <li className="flex items-center gap-4">
                    <Typography variant="small" color="blue-gray" className="font-semibold w-24">
                      Member Since:
                    </Typography>
                    <Typography variant="small" className="font-normal text-blue-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </Typography>
                  </li>
                 
                  <li className="flex items-center gap-4">
                    <Typography variant="small" color="blue-gray" className="font-semibold w-24">
                      KYC Document:
                    </Typography>
                    <div className="flex items-center gap-2">
                      <a
                        href={`${user.kyc?.documents_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        View Document
                      </a>
                      <Typography variant="small" className="text-blue-gray-500">
                        (ID/Passport/License)
                      </Typography>
                    </div>
                  </li>
                  <li className="flex items-center gap-4">
                    <Typography variant="small" color="blue-gray" className="font-semibold w-24">
                      KYC Status:
                    </Typography>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          Current Status:
                        </Typography>
                        <div className={`px-3 py-1 rounded-full text-xs ${
                          user.kyc?.kyc_status?.toLowerCase() === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : user.kyc?.kyc_status?.toLowerCase() === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.kyc?.kyc_status?.toUpperCase()}
                        </div>
                      </div>
                      {user.kyc?.rejection_reason && (
                        <div className="flex items-center gap-4">
                          <Typography variant="small" color="blue-gray" className="font-semibold">
                            Rejection Reason:
                          </Typography>
                          <Typography variant="small" className="text-red-500">
                            {user.kyc?.rejection_reason}
                          </Typography>
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          KYC Actions:
                        </Typography>
                        {(user.kyc?.kyc_status?.toLowerCase() === 'pending' || 
                          user.kyc?.kyc_status?.toLowerCase() === 'rejected') && (
                          <div className="flex gap-2">
                            <button
                              className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:bg-green-300"
                              onClick={() => handleKycAction('approved')}
                              disabled={isApproving}
                            >
                              {isApproving ? 'Approving...' : 'Approve'}
                            </button>
                            {user.kyc?.kyc_status?.toLowerCase() === 'pending' && (
                              <button
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                                onClick={() => handleKycAction('rejected')}
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        )}
                                {user.kyc?.kyc_status?.toLowerCase() === 'rejected' && (
                          <Typography variant="small" className="text-red-500">
                            KYC was rejected
                          </Typography>
                        )}
                        {user.kyc?.kyc_status?.toLowerCase() === 'approved' && (
                          <Typography variant="small" className="text-green-500">
                            KYC is approved
                          </Typography>
                        )}
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-4">
                  Account Status
                </Typography>
                <div className="flex flex-col gap-6">
                  <Switch
                    id="status"
                    label="Account Active"
                    checked={user.status?.toLowerCase() === "active"}
                    onChange={(e) => handleStatusChange(e.target.checked)}
                    disabled={isUpdatingStatus}
                    labelProps={{
                      className: "text-sm font-normal text-blue-gray-500",
                    }}
                  />
                  <Switch
                    id="emailVerified"
                    label="Email Verified"
                    defaultChecked={user.email_verified_at !== null}
                    labelProps={{
                      className: "text-sm font-normal text-blue-gray-500",
                    }}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </>
    );
  }