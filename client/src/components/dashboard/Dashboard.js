import React, { useEffect, Fragment } from "react";
import { Link, Route } from "react-router-dom";

import PropTypes from "prop-types";
import Experience from "./Experience";
import Eudcation from "./Education";
import Spinner from "../layout/Spinner";
import { connect } from "react-redux";
import { DashboardActions } from "./DashboardActions";
import Chat from "../Chat/Chat";
import { deleteAccount, getCurrentProfile } from "../../actions/profile";
import Education from "./Education";

function Dashboard({
  getCurrentProfile,
  deleteAccount,
  auth: { user },
  profile: { profile, loading },
}) {
  useEffect(() => {
    getCurrentProfile();
  }, [getCurrentProfile]);

  return loading && profile === null ? (
    <Spinner />
  ) : (
    <Fragment>
      <h1 className="large text-primary">Dashboard</h1>
      <p className="lead">
        <i className="fas fa-user"></i>Welcome {user && user.name}
      </p>
      {profile != null ? (
        <Fragment>
          <DashboardActions />

          <Experience experience={profile.experience} />
          <Eudcation education={profile.education} />
          <div className="my-2">
            <button className="btn btn-danger" onClick={() => deleteAccount()}>
              <i className="fas fa-user-minus"></i>Delete Account
            </button>
            <button
              className="btn btn-danger"
              onClick={ () =><Route exact path="/chat" component={Chat} />}
            >
              <i className="fas fa-comment-alt"></i>
              Chat
            </button>
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <p>You have not yet created profile, please add some info </p>
          <Link to="/create-profile" className="btn btn-primary my-1">
            Create Profile
          </Link>
        </Fragment>
      )}
    </Fragment>
  );
}

Dashboard.propTypes = {
  getCurrentProfile: PropTypes.func.isRequired,
  deleteAccount: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  profile: state.profile,
});

export default connect(mapStateToProps, { getCurrentProfile, deleteAccount })(
  Dashboard
);
