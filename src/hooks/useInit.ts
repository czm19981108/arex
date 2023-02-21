import { useRequest } from 'ahooks';
import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AccessTokenKey, EmailKey, RefreshTokenKey } from '../constant';
import {
  clearLocalStorage,
  genPaneIdByUrl,
  getLocalStorage,
  getMenuTypeByPageType,
  setLocalStorage,
} from '../helpers/utils';
import { AuthService } from '../services/Auth.service';
import { UserService } from '../services/User.service';
import { useStore } from '../store';
import useUserProfile from '../store/useUserProfile';

// init theme, fontSize, etc.
// 由于使用了 useParams hook, 该 hook 只在 RouterComponent 中生效
// (例如在 App.tsx 中无效
const useInit = () => {
  // checkout if the user is logged in
  const email = getLocalStorage<string>(EmailKey);

  const nav = useNavigate();
  const params = useParams();
  const { pathname } = useLocation();
  const { setUserProfile } = useUserProfile();
  const { setActiveMenu, setActiveWorkspaceId } = useStore();

  const { run: refreshToken } = useRequest(AuthService.refreshToken, {
    manual: true,
    onSuccess(res) {
      if (res.data.body) {
        const accessToken = res.data.body.accessToken;
        const refreshToken = res.data.body.refreshToken;
        setLocalStorage(AccessTokenKey, accessToken);
        setLocalStorage(RefreshTokenKey, refreshToken);
        window.location.reload();
      } else if (pathname !== '/login') {
        clearLocalStorage();
        window.location.reload();
      }
    },
    onError() {
      clearLocalStorage();
      window.location.reload();
    },
  });

  useRequest(() => UserService.getUserProfile(email as string), {
    ready: !!email,
    onSuccess(res) {
      res && setUserProfile(res);
    },
    onError() {
      // token过期了以后来刷新，如果还是没通过就退出
      email && refreshToken({ userName: email });
    },
  });

  // TODO 实现通用的所用页面初始化方法
  // 根据 url 初始化页面, 同时初始化 workspaceId
  useEffect(() => {
    if (params.workspaceId) {
      setActiveWorkspaceId(params.workspaceId);
    }
    if (params.pagesType) {
      setActiveMenu(
        getMenuTypeByPageType(params.pagesType),
        genPaneIdByUrl(
          `/${params.workspaceId}/${params.workspaceName}/${params.pagesType}/${params.rawId}`,
        ),
      );
    }
  }, []);
};

export default useInit;
