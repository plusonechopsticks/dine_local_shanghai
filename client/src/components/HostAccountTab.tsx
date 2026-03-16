import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    passwordChanged: "密码已更改",
    passwordChangedSuccess: "您的密码已成功更改",
    passwordError: "密码更改失败，请重试",
    passwordMismatch: "新密码不匹配",
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
    passwordChanged: "Password Changed",
    passwordChangedSuccess: "Your password has been changed successfully",
    passwordError: "Failed to change password, please try again",
    passwordMismatch: "New passwords do not match",
  },
};

export default function HostAccountTab({
  hostEmail,
  language,
}: {
  hostEmail: string;
  language: Language;
}) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const t = translations[language];

  const showToast = (title: string, description?: string) => {
    alert(`${title}${description ? ': ' + description : ''}`);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast(t.passwordMismatch);
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call tRPC mutation to change password
      // const result = await trpc.hostAuth.changePassword.mutate({
      //   currentPassword,
      //   newPassword,
      // });

      showToast(t.passwordChanged, t.passwordChangedSuccess);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (error) {
      showToast("Error", t.passwordError);
    } finally {
      setIsLoading(false);
    }
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
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordForm(true)}
                >
                  {t.changePassword}
                </Button>
              )}
            </div>

            {showPasswordForm && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    {t.currentPassword}
                  </label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t.currentPassword}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    {t.newPassword}
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t.newPassword}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    {t.confirmPassword}
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.confirmPassword}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleChangePassword}
                    disabled={isLoading}
                  >
                    {t.save}
                  </Button>
                  <Button
                    variant="outline"
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
