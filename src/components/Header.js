import React from 'react';

const Header = ({ title, needthird = true, onMenuClick }) => {
  return (
    <header style={{ left: '0', width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none' }}>
      <div className="titleArea">
        {/* 왼쪽의 백 버튼 */}
        <div style = {{width: '30px', height:'30px', display: 'flex', justifyContent:'center', alignItems:'center'}}>
          <img
            src="/static/icons/back_double.webp"
            alt="back"
            id="back-button"
            onClick={() => window.history.back()}
            style={{ cursor: 'pointer' , size:'contain', width: '100%'}}
          />
        </div>
        
        {/* 가운데 제목 */}
        <div style={{ fontSize: '20px', color: '#412823', textAlign: 'center', flex: 1, verticalAlign:'center', minWidth: '50%' }}>
          {title}
        </div>

        {/* 오른쪽 메뉴 버튼 */}
        <div style =  {{width: '30px', height:'30px', display: 'flex', justifyContent:'center', alignItems:'center'}} onClick={onMenuClick}>
          {needthird && (

              <img src="/static/icons/hamburger.webp" alt="menu" id="menu-button" style={{ size:'contain', width: '100%', height:'100%'}}/>

          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
