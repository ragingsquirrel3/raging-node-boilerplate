import React from 'react';
import { Link } from 'react-router';

export default class Layout extends React.Component {
  render () {
    return (
      <div className='container'>
        <div className="header clearfix">
          <nav>
            <ul className="nav nav-pills pull-right">
              <li role="presentation"><Link to='/about'>About</Link></li>
              <li role="presentation"><Link to='/contact'>Contact</Link></li>
            </ul>
          </nav>
          <h3 className="text-muted"><Link to='/'><span className='glyphicon glyphicon-home'></span></Link></h3>
        </div>
        <div className='content-container'>
          {this.props.children}
        </div>
        <footer className="footer">
          <div className='row'>
            <div className='col-lg-12'>
              <p>&copy; 2016 Travis Sheppard</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }
};
