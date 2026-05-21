import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Language = "zh" | "en";

const translations = {
  zh: {
    account: "账户设置",
    description: "管理您的账户和安全设置",
    email: "邮箱",
    changePassword: "更改密码",
    currentPassword: "当前密码",
    newPassword: "新密码",
    confirmPassword: "确认密码",
    save: "保存",
    cancel: "取消",
    passwordChangedSuccess: "密码已成功更改",
    passwordError: "密码更改失败，请重试",
    passwordMismatch: "新密码不匹配",
    passwordTooShort: "新密码至少需要6个字符",
    wrongCurrentPassword: "当前密码不正确",
    saving: "保存中...",
  },
  en: {
    account: "Account Settings",
    description: "Manage your account and security settings",
    email: "Email",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    save: "Save",
    cancel: "Cancel",
    passwordChangedSuccess: "Password changed successfully",
    passwordError: "Failed to change password, please try again",
    passwordMismatch: "New passwords do not match",
    passwordTooShort: "New password must be at least 6 characters",
    wrongCurrentPassword: "Current password is incorrect",
    saving: "Saving...",
  },
};

export default function HostAccountTab({
  hostEmail,
  hostId,
  language,
}: {
  hostEmail: string;
  hostId: number | null;
  language: Language;
}) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const t = translations[language];

  const changePasswordMutation = trpc.hostAuth.changePassword.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(t.passwordChangedSuccess);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordForm(false);
      } else {
        const msg = data.error === "Current password is incorrect"
          ? t.wrongCurrentPassword
          : t.passwordError;
        toast.error(msg);
      }
    },
    onError: () => {
      toast.error(t.passwordError);
    },
  });

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error(t.passwordMismatch);
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t.passwordTooShort);
      return;
    }
    if (!hostId) return;
    changePasswordMutation.mutate({
      hostId,
      currentPassword,
      newPassword,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.account}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Display */}
          <div>
            <label className="text-sm font-medium block mb-2">{t.email}</label>
            <Input value={hostEmail} disabled />
          </div>

          {/* Change Password Section */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{t.changePassword}</h3>
              {!showPasswordForm && (
                <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
                  {t.changePassword}
                </Button>
              )}
            </div>

            {showPasswordForm && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">{t.currentPassword}</label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t.currentPassword}
                    disabled={changePasswordMutation.isPending}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">{t.newPassword}</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t.newPassword}
                    disabled={changePasswordMutation.isPending}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">{t.confirmPassword}</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.confirmPassword}
                    disabled={changePasswordMutation.isPending}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleChangePassword} disabled={changePasswordMutation.isPending}>
                    {changePasswordMutation.isPending ? t.saving : t.save}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={changePasswordMutation.isPending}
                    onClick={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                  >
                    {t.cancel}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
