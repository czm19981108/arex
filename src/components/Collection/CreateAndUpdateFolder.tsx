import {Button, Input, Modal} from 'antd';
import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {FileSystemService} from "../../api/FileSystemService";

const CreateAndUpdateFolder: React.FC = ({reFe},ref) => {
  const [folderName, setFolderName] = useState('');
  const [currOpePath, setCurrOpePath] = useState([]);
  const [mode, setMode] = useState('create');
  // 此处注意useImperativeHandle方法的的第一个参数是目标元素的ref引用
  useImperativeHandle(ref, () => ({
    // changeVal 就是暴露给父组件的方法
    changeVal: (newVal) => {
      setMode(newVal.mode)
      // console.log(newVal.key,'newVal')
      setCurrOpePath(newVal.path)
      showModal()
    }
  }));
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    console.log(folderName,'folderName')

    if (mode === 'create'){
      FileSystemService.addItem({
        "id": "62ab189bbf79d0746fc74268",
        "nodeName": folderName,
        "nodeType": 3,
        "parentPath": currOpePath.join('.'),
        "userName": "zt",
        // "workspaceName": "string"
      }).then(()=>{
        setIsModalVisible(false);
        reFe()
      })
    } else {
      FileSystemService.rename({
        "id": "62ab189bbf79d0746fc74268",
        // "nodeName": folderName,
        // "nodeType": 3,
        "path": currOpePath.join('.'),
        "newName": folderName,
      }).then(()=>{
        setIsModalVisible(false);
        reFe()
      })
    }


    // setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        {currOpePath}
      </Button>
      <Modal title={mode} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <p>{folderName}</p>
        <Input value={folderName} onChange={(e)=>{
          // console.log(e.target.value,'e.target.value')
          setFolderName(e.target.value)
        }}/>
      </Modal>
    </>
  );
};

export default forwardRef(CreateAndUpdateFolder);
